import { getSnapshot } from "mobx-state-tree";
import { GenericContainer } from "./test-utils";
import { Operation, Variable, VariableType } from "./variable";

describe("Variable", () => {
  it("Can be created", () => {
    const variable = Variable.create();

    // It should have an id with a length of 16
    expect(variable.id).toBeDefined();
    expect(variable.id).toHaveLength(16);
  });

  it("with no inputs, its own value, and no unit", () => {
    const variable = Variable.create({value: 123.5});
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 123.5});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
    expect(variable.computedValue).toBe(123.5);
    expect(variable.computedValueWithSignificantDigits).toBe("123.5");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedValueMessage).toBeUndefined();
    expect(variable.computedUnit).toBeUndefined();
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
  });

  it("with 1 inputA it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9},
        {id: "variable", value: 123.5, inputA: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedValue).toBe(999.9);

  });

  it("with 1 inputA of 0 it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 0},
        {id: "variable", value: 123.5, inputA: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedValue).toBe(0);

  });

  it("with 1 inputB it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputB).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedValue).toBe(999.9);

  });

  it("with 1 inputB of 0 it returns the input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 0},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputB).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedValue).toBe(0);

  });

  it("with 2 inputs and no operation it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999.9},
        {id: "inputB", value: 111.1},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "no operation"});
    expect(variable.computedValue).toBeUndefined();
    // The no operation is not included in the units
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
  });

  it("with 2 inputs and no operation and a unit, it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999.9},
        {id: "inputB", value: 111.1},
        {id: "variable", value: 123.5, unit: "m", inputA: "inputA", inputB: "inputB"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "no operation"});
    expect(variable.computedValue).toBeUndefined();
    // The no operation is not included in the units
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
  });

  it("with 2 inputs and operation Multiply it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999},
        {id: "inputB", value: 111},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Multiply}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 110_889});
    expect(variable.computedValue).toBe(110_889);
  });

  it("with only a unit'd inputA and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
    expect(variable.computedValue).toBe(999.9);
    expect(variable.computedValueWithSignificantDigits).toBe("999.9");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBe("mm");
    expect(variable.computedUnitError).toBeUndefined();
    expect(variable.computedUnitMessage).toBeUndefined();
  });

  it("with only a unit'd inputA of 0 and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 0, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with only a unit'd inputB and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 999.9});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with only a unit'd inputB of 0 and no unit of its own it returns the input value and unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 0, unit: "mm"},
        {id: "variable", value: 123.5, inputB: "input"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "mm"});
  });

  it("with 1 different unit input it returns the converted input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input", unit: "cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 99.99});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 different unit input of 0 it returns the converted input value, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 0, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input", unit: "cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 different valueless unit input it returns the converted unit, ignoring its own value", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input", unit: "cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("with 1 incompatible unit input it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 999.9, unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input", unit: "N"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    // TODO: this case should be checked with project leaders: do we want to
    // pass the unit through to future nodes that depend on this one when there
    // is an error like this?  
    // Reason to pass it through:
    //   it limits the number of error messages shown so it would be easier to
    //   track down the problem.
    // Reason not to pass it through:
    //   If the user is only looking at the final output they might notice they
    //   have an error in their units further up the chain
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "N", error: "incompatible units"});
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedValueWithSignificantDigits).toBe("NaN");
    expect(variable.computedValueError).toBe("incompatible units");
    expect(variable.computedUnit).toBe("N");
    expect(variable.computedUnitError).toBe("incompatible units");
    expect(variable.computedUnitMessage).toBeUndefined();

  });

  it("with 1 incompatible valueless unit input it returns an error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", unit: "mm"},
        {id: "variable", value: 123.5, inputA: "input", unit: "N"}
      ]
    });
    const input = container.items[0] as VariableType;
    const variable = container.items[1] as VariableType;

    expect(variable.inputA).toEqual(input);
    expect(variable.numberOfInputs).toBe(1);
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "N", error: "incompatible units"});
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedValueWithSignificantDigits).toBe("NaN");
    expect(variable.computedValueError).toBeUndefined();
    expect(variable.computedUnit).toBe("N");
    expect(variable.computedUnitError).toBe("incompatible units");
    expect(variable.computedUnitMessage).toBeUndefined();

  });

  it("with a compound custom unit input and a compatible compound custom unit it does the conversion", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 9, unit: "m/things"},
        {id: "variable", inputA: "input", unit: "cm/things"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 900});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm / things"});
  });

  it("with a invalid unit in A it returns without crashing", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 9, unit: "m/"},
        {id: "variable", inputA: "input", unit: "cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({message: "cannot compute value from inputs"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "invalid input units"});

  });

  it("with a invalid unit in B it returns without crashing", () => {
    const container = GenericContainer.create({
      items: [
        {id: "input", value: 9, unit: "m/"},
        {id: "variable", inputB: "input", unit: "cm"}
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({message: "cannot compute value from inputs"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "invalid input units"});

  });

  it("with 2 inputs with units and operation multiply it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 999, unit: "m"},
        {id: "inputB", value: 111, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Multiply}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 110_889});
    expect(variable.computedValue).toBe(110_889);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m^2"});
  });

  it("with 2 inputs with units and operation divide it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 2});
    expect(variable.computedValue).toBe(2);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m / s"});
  });

  it("with 2 inputs with matching units and operation add it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 30});
    expect(variable.computedValue).toBe(30);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation add it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 10, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  it("with 2 inputs with matching units and operation subtract it returns result", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 5, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 15});
    expect(variable.computedValue).toBe(15);
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m"});
  });

  it("with 2 inputs with different units and operation subtract it returns a unit error", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 20, unit: "m"},
        {id: "inputB", value: 5, unit: "s"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedValue).toBeUndefined();
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  it("with 2 inputs with units, operation Multiply, " + 
      "and different compatible output unit the unit is converted", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 2, unit: "m"},
        {id: "inputB", value: 3, unit: "m"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Multiply, unit: "mm^2"}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.numberOfInputs).toBe(2);
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 6_000_000});
    expect(variable.computedValue).toBe(6_000_000);
    expect(variable.computedUnit).toBe("mm^2");
  });

  it("handles a custom unit being added to the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 98, unit: "things"},
        {id: "inputB", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 100});
    expect(variable.computedUnit).toBe("things");
  });

  it("handles a custom unit being subtracted from the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 98, unit: "things"},
        {id: "inputB", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 96});
    expect(variable.computedUnit).toBe("things");
  });

  it("handles a custom unit divided by the same custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 98, unit: "things"},
        {id: "inputB", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 49});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({message: "units cancel"});
  });

  it("handles a compound unit that includes a custom unit multiplying by the custom unit", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 50, unit: "m/things"},
        {id: "inputB", value: 2, unit: "things"},
        {id: "variable", value: 123.5, inputA: "inputA", inputB: "inputB", 
          operation: Operation.Multiply}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 100});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"m"});
  });

  it("handles adding compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m"},
        {id: "inputB", value: 100, unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 200});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"cm"});
  });

  it("handles adding compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", unit: "m"},
        {id: "inputB", unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"cm"});
  });

  it("handles subtracting compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 2, unit: "m"},
        {id: "inputB", value: 100, unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 100});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"cm"});
  });

  it("handles subtracting compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", unit: "m"},
        {id: "inputB", unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Subtract}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit:"cm"});
  });

  it("handles dividing compatible units with values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m"},
        {id: "inputB", value: 100, unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({message: "units cancel"});
  });

  it("handles dividing compatible units without values", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", unit: "m"},
        {id: "inputB", unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({message: "units cancel"});
  });

  it("handles dividing custom units", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "widgets"},
        {id: "inputB", value: 100, unit: "widgets"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Divide}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedUnitIncludingMessageAndError).toEqual({message: "units cancel"});
    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 0.01});
  });

  it("handles invalid units", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m/"},
        {id: "inputB", value: 100, unit: "s"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Multiply}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "invalid input units"});
    expect(variable.computedValueIncludingMessageAndError).toEqual({message: "cannot compute value from inputs"});
  });

  it("handles adding compatible inputs first with a value and second without a value", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m"},
        {id: "inputB", unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    // If there is no value for one of the inputs we cannot compute the output
    // value. There might be a unit.
    //
    // We don't show an explicit error here: The current UI shows NaN for the
    // value, so this seems like enough of a error message.
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("handles adding compatible inputs first without a value and second with a value", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", unit: "m"},
        {id: "inputB", value: 1, unit: "cm"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    // If there is no value for one of the inputs we cannot compute the output
    // value. There might be a unit.
    //
    // We don't show an explicit error here: The current UI shows NaN for the
    // value, so this seems like enough of a error message.
    expect(variable.computedValueIncludingMessageAndError).toEqual({});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "cm"});
  });

  it("shows error when adding inputs first without a unit and second with a unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1},
        {id: "inputB", value: 1, unit: "m"},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  it("shows error when adding inputs first with a unit and second without a unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m"},
        {id: "inputB", value: 1},
        {id: "variable", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({error: "incompatible units"});
  });

  it("shows error when adding inputs first without a unit and second with a unit and an output unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1},
        {id: "inputB", value: 1, unit: "m"},
        {id: "variable", unit: "m",  inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m", error: "incompatible units"});
  });

  it("shows error when adding inputs first with a unit and second without a unit and an output unit", () => {
    // This can happen when a user is typing a unit
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1, unit: "m"},
        {id: "inputB", value: 1},
        {id: "variable", unit: "m", inputA: "inputA", inputB: "inputB", 
          operation: Operation.Add}
      ]
    });
    const variable = container.items[2] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m", error: "incompatible units"});
  });

  // This might be fixable by calling `simplify` 
  it("doesn't handle units canceling in a unit typed by a user", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1 },
        {id: "variable", unit: "m / m", inputA: "inputA" }
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({error: "incompatible units"});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({unit: "m / m", error: "incompatible units"});
  });

  it("handles unit-less single inputA", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputA", value: 1 },
        {id: "variable", inputA: "inputA" }
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
  });

  it("handles unit-less single inputB", () => {
    const container = GenericContainer.create({
      items: [
        {id: "inputB", value: 1 },
        {id: "variable", inputB: "inputB" }
      ]
    });
    const variable = container.items[1] as VariableType;

    expect(variable.computedValueIncludingMessageAndError).toEqual({value: 1});
    expect(variable.computedUnitIncludingMessageAndError).toEqual({});
  });

  it("can be modified after being created", () => {
    const inputA = Variable.create();
    const inputB = Variable.create();
    const variable = Variable.create();
    const container = GenericContainer.create();
    container.add(inputA);
    container.add(inputB);
    container.add(variable);

    variable.setInputA(inputA);
    variable.setInputB(inputB);
    variable.setValue(123.5);
    variable.setUnit("m");
    variable.setName("my variable");
    variable.setOperation(Operation.Add);

    expect(getSnapshot(variable)).toEqual({
      id: expect.stringMatching(/^.{16}$/),
      inputA: inputA.id,
      inputB: inputB.id,
      value: 123.5,
      unit: "m",
      name: "my variable",
      operation: "+"
    });
  });

  // TODO: need tests about partially created units. When the user is typing a
  // unit the code will run as they type. This will trigger the creation of a
  // custom unit for this partially typed unit. And then this unit will not be
  // removed afterwards. So now these partially typed units might cause hard to
  // understand error messages when expressions are typed by users. The
  // evaluator might interpret a missing variable as a partial unit. 
});
