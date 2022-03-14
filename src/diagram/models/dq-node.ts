import { simplify } from "../custom-mathjs";
import { IAnyComplexType, Instance, SnapshotIn, types } from "mobx-state-tree";
import { nanoid } from "nanoid";
import { ArrowHeadType, Elements } from "react-flow-renderer/nocss";
import { getUnitConversion } from "./unit-conversion";

export enum Operation {
    Divide = "÷",
    Multiply = "×",
    Add = "+",
    Subtract = "-"
}

export function tryToSimplify(operation: "÷"|"×", inputAUnit?:string, inputBUnit?: string) {
    if (!inputAUnit && !inputBUnit) {
        // If there is no unit on both inputs then return no unit
        // and don't show the "units cancel" message
        return {};
    }

    const aUnit = inputAUnit || "1";
    const bUnit = inputBUnit || "1";

    let newUnit = "";
    switch (operation) {
        case "÷":
            newUnit = `(${aUnit})/(${bUnit})`;
            break;
        case "×":
            newUnit = `(${aUnit})*(${bUnit})`;
            break;
        default:
            break;
    }

    try {
      const result = simplify(newUnit).toString();
      if (result === "1") {
        return {message: "units cancel"};
      }
      return {unit: result};
    } catch (error) {
      return {error: "cannot simplify combined unit"};
    }
}

export const DQNode = types.model("DQNode", {
    id: types.optional(types.identifier, () => nanoid(16)),
    name: types.maybe(types.string),
    unit: types.maybe(types.string),
    value: types.maybe(types.number),
    inputA: types.maybe(types.safeReference(types.late((): IAnyComplexType => DQNode))),
    inputB: types.maybe(types.safeReference(types.late((): IAnyComplexType => DQNode))),
    operation: types.maybe(types.enumeration<Operation>(Object.values(Operation))),

    // The x and y values are required when initializing the react flow
    // component. However the react flow component ignores them after this.
    // To serialize the state the positions need to be extracted from the react flow
    // and then applied to the models.
    x: types.number,
    y: types.number
})
    // deprecated, but serves our purposes better than the alternatives (e.g. snapshotProcessor)
    .preProcessSnapshot(sn => {
        // null values have been encountered in the field
        if (sn.value == null) {
            const { value, ...others } = sn;
            return others;
        }
        return sn;
    })
    .views(self => ({
        get reactFlowElements() {
            const elements: Elements = [];
            const {id} = self;
            const inputA = self.inputA as typeof self | undefined;
            const inputB = self.inputB as typeof self | undefined;
            elements.push({
                id,
                type: "quantityNode",
                data: { node:  self },
                position: { x: self.x, y: self.y },
            });
            if (inputA) {
                elements.push({
                    id: `e${inputA.id}-${id}-a`,
                    source: inputA.id,
                    target: id,
                    targetHandle: "a",
                    arrowHeadType: ArrowHeadType.ArrowClosed
                });
            }
            if (inputB) {
                elements.push({
                    id: `e${inputB.id}-${id}-b`,
                    source: inputB.id,
                    target: id,
                    targetHandle: "b",
                    arrowHeadType: ArrowHeadType.ArrowClosed
                });
            }

            return elements;
        },
        get numberOfInputs() {
            let count = 0;
            if (self.inputA) {
                count++;
            }
            if (self.inputB) {
                count++;
            }
            return count;
        },
        get firstValidInput() {
            return self.inputA || self.inputB;
        }
    }))
    .views(self => ({
        // previous node values override current node values
        get computedValueIncludingError(): {value?:number, error?:string} {
            if ((self.numberOfInputs === 1)) {
                // We have to cast the input to any because we are calling the functions
                // computedUnit and computedValue
                // Those functions are what we are defining here so TS doesn't know they exist on DQNode yet.
                const input = self.firstValidInput as any;

                // @ts-expect-error THIS
                const convertValue = getUnitConversion((input).computedUnit, this.computedUnit);
                if (convertValue) {
                    // It'd be nice to record this error but doing it here would be
                    // a side effect which probably shouldn't happen in a computed value
                    // self.error = undefined;
                    return {value: convertValue(input.computedValue)};
                }
                return {error: "Error in unit conversion"};
            }
            if (self.inputA && self.inputB) {
                // We currently ignore units in this case
                let value;
                switch (self.operation) {
                    case "÷":
                        // @ts-expect-error THIS
                        value = this.inputA.computedValue / this.inputB.computedValue;
                        break;
                    case "×":
                        // @ts-expect-error THIS
                        value = this.inputA.computedValue * this.inputB.computedValue;
                        break;
                    case "+":
                        // @ts-expect-error THIS
                        value = this.inputA.computedValue + this.inputB.computedValue;
                        break;
                    case "-":
                        // @ts-expect-error THIS
                        value = this.inputA.computedValue - this.inputB.computedValue;
                        break;
                    default:
                        break;
                }
                if (self.operation) {
                    return {value};
                } else {
                    return {error: "no operation"};
                }
            }
            return {value: self.value};
        },
        // If there are two inputs then units can't be changed
        // otherwise current node units override previous node units
        get computedUnitIncludingMessageAndError(): {unit?: string, error?: string, message?: string} {
            if (self.inputA && self.inputB) {
                if (self.operation) {
                    // If there is no unit, then use "1", that way the simplification of multiplication
                    // and division will work properly
                    // @ts-expect-error THIS
                    const inputAUnit = this.inputA.computedUnit;
                    // @ts-expect-error THIS
                    const inputBUnit = this.inputB.computedUnit;
                    switch (self.operation) {
                        case "÷":
                        case "×":
                            return tryToSimplify(self.operation, inputAUnit, inputBUnit);
                        case "+":
                        case "-":
                            if (inputAUnit !== inputBUnit) {
                                return {error: "incompatible units"};
                            }
                            return {unit: inputAUnit};
                        default:
                            break;
                    }
                } else {
                    // We have 2 inputs (with or without units), but no operation
                    // The computedValue code above is already going to provide a warning about
                    // this
                    return {};
                }
            }
            if (self.unit) {
                return {unit: self.unit};
            }
            if ((self.inputA && !self.inputB) || (self.inputB && !self.inputA)) {
                // @ts-expect-error THIS
                const input = this.inputA || this.inputB;
                return {unit: input.computedUnit};
            }
            if (!self.inputA && !self.inputB && !self.unit) {
                // There is no unit specified and no input unit
                // this might be on purpose for a unit-less operation
                return {};
            }
            // We really shouldn't reach here
            return {error: "unknown unit state"};
        }
    }))
    .views(self => ({
        get computedValue() {
            return self.computedValueIncludingError.value;
        },
        get computedValueWithSignificantDigits() {
            // Currently this just uses a fixed set of fractional digits instead of keeping track of
            // significant digits
            const value = self.computedValueIncludingError.value;

            // In practice Chrome's format returns "NaN" for undefined values, but typescript
            // isn't happy with passing undefined
            if (value === undefined) {
                return "NaN";
            }
            // The first argument is the locale, using undefined means it should pick up the default
            // browser locale
            return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(value);
        },
        get computedValueError() {
            return self.computedValueIncludingError.error;
        },
        get computedUnit() {
            return self.computedUnitIncludingMessageAndError.unit;
        },
        get computedUnitError() {
            return self.computedUnitIncludingMessageAndError.error;
        },
        get computedUnitMessage() {
            return self.computedUnitIncludingMessageAndError.message;
        }
    }))
    .actions(self => ({
        setInputA(newInputA: Instance<IAnyComplexType> | undefined) {
            self.inputA = newInputA;
        },
        setInputB(newInputB: Instance<IAnyComplexType> | undefined) {
            self.inputB = newInputB;
        },
        setValue(newValue?: number) {
            self.value = newValue;
        },
        setUnit(newUnit?: string) {
            self.unit = newUnit;
        },
        setName(newName?: string) {
            self.name = newName;
        },
        setOperation(newOperation?: Operation) {
            self.operation = newOperation;
        },
        // Note: as far as I know React Flow will ignore this change
        // it only pays attention to the position of the node when the
        // diagram is first initialized
        updatePosition(x: number, y: number) {
            self.x = x;
            self.y = y;
        }
    }));
export interface DQNodeType extends Instance<typeof DQNode> {}
export interface DQNodeSnapshot extends SnapshotIn<typeof DQNode> {}
