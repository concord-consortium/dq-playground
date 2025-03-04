import { createMath } from "./custom-mathjs";
import { UnitsManager } from "./units-manager";
import { IMathLib } from "./utils/mathjs-utils";

describe("MathJS", () => {
  let unitsManager: UnitsManager;
  let evaluate: IMathLib["evaluate"];
  let unit: IMathLib["unit"];

  beforeEach(() => {
    unitsManager = new UnitsManager();
    const math = createMath(unitsManager);
    evaluate = math.evaluate;
    unit = math.unit;
  });

  it("can handle unit conversion with evaluate and unit values", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(100, "cm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(2, "m"));
    expect(result.toString()).toEqual("2 m");
  });

  it("converts to the first unit", () => {
    const scope = {
      a: unit(100, "cm"),
      b: unit(1, "m")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(200, "cm"));
    expect(result.toString()).toEqual("200 cm");
  });

  it("can't handle unit addition with evaluate and valueless units", () => {
    const scope = {
      a: unit("m"),
      b: unit("cm")
    };
    expect(() => evaluate("a+b", scope)).toThrow();
  });

  it("sort of handles simple unit conversion with evaluate and a valueless unit", () => {
    // This isn't really useful to us because it adds a value.
    // If we allow the user to use `to` method in an expression and the input
    // has no value then it won't be obvious if the result should have a value
    // or not. So instead we will probably need to assign a value to a if it
    // doesn't have one in order to find the unit. And assume if a doesn't have
    // a value then result also doesn't have a value.
    const scope = {
      a: unit("m"),
    };
    const result = evaluate("a to cm", scope);
    expect(result.toJSON()).toEqual({
      mathjs: "Unit",
      fixPrefix: true,
      unit: "cm",
      value: 100});
  });

  it("automatically simplifies units with some functions and not with others", () => {
    const scope = {
      a: unit(1, "m/s"),
      b: unit(1, "s")
    };
    const result = evaluate("a*b", scope);
    expect(result.toString()).toEqual("1 m");
    expect(result.format({})).toEqual("1 m");
    expect(result.toJSON().unit).toEqual("(m s) / s");
    expect(result.formatUnits()).toEqual("(m s) / s");
  });

  it("simplifies units when simplify is called", () => {
    const scope = {
      a: unit(1, "m/s"),
      b: unit(1, "s")
    };
    const result = evaluate("a*b", scope);
    const simp = result.simplify();
    expect(simp.toString()).toEqual("1 m");
    expect(simp.toJSON().unit).toEqual("m");
    expect(simp.formatUnits()).toEqual("m");
  });

  it("does not automatically simplify when the unit is directly constructed", () => {
    const result = unit(1, "(m s) / s");
    expect(result.toString()).toEqual("1 (m s) / s");
    expect(result.format({})).toEqual("1 (m s) / s");
    expect(result.toJSON().unit).toEqual("(m s) / s");
    expect(result.formatUnits()).toEqual("(m s) / s");
  });

  it("returns a Unit when the units cancel on manually created unit", () => {
    const result = unit(1, "m / m");
    const simp = result.simplify();
    expect(simp.toString()).toEqual("1");
    expect(simp.format({})).toEqual("1");
    expect(simp.toJSON().unit).toEqual("");
    expect(simp.formatUnits()).toEqual("");
  });

  it("returns a number when the units cancel in an expression", () => {
    const scope = {
      a: unit(1, "s"),
      b: unit(1, "s")
    };
    const result = evaluate("a/b", scope);
    expect(result).toEqual(1);
  });

  it("handles unit conversions mixed into the expression, but doesn't simplify automatically", () => {
    const scope = {
      a: unit(1, "mi/hr")
    };
    const result = evaluate("(a to m/s) * 2 s", scope);
    expect(result.toJSON()).toEqual({
      fixPrefix: true,
      mathjs: "Unit",
      unit:"(m s) / s",
      value: 0.89408
    });
    const simp = result.simplify();
    expect(simp.toJSON()).toEqual({
      fixPrefix: true,
      mathjs: "Unit",
      unit:"m",
      value: 0.89408
    });
  });

  it("handles unit conversions on the fly if simplify is used", () => {
    const scope = {
      a: unit(1, "mi/hr")
    };
    const result = evaluate("a * 2 s", scope);

    // The un-simplified result is an unexpected behavior.
    // But it kind of makes since it isn't clear what should happen with
    // `s / hr`
    expect(result.toJSON()).toEqual({
      fixPrefix: false,
      mathjs: "Unit",
      unit: "(mi s) / hr",
      value: 2
    });
    const simp = result.simplify();
    expect(simp.toJSON()).toMatchObject({
      fixPrefix: false,
      mathjs: "Unit",
      unit: "mi",
      // This is supported in Jest but the types don't allow it
      // value: expect.closeTo(0.00055, 5)
    });
    expect(simp.toJSON().value).toBeCloseTo(0.000555, 5);
  });

  it("does not automatically adjusts unit prefix", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(1, "cm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(1.01, "m"));
    expect(result.toString()).toEqual("1.01 m");
  });

  it("does not automatically adjusts unit prefix in powers of 3", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(1, "mm")
    };
    const result = evaluate("a+b", scope);
    expect(result).toEqual(unit(1.001, "m"));
    expect(result.toString()).toEqual("1.001 m");
  });

  it("automatically adjusts unit prefix with simplify", () => {
    const scope = {
      a: unit(1, "m"),
      b: unit(100, "cm")
    };
    const result = evaluate("a+b", scope);
    const simpl = result.simplify();
    expect(simpl).toEqual(unit(200, "cm"));
    expect(simpl.toString()).toEqual("200 cm");
  });

  describe("throws predictable exceptions", () => {
    test("incompatible units", () => {
      const scope = {
        a: unit(1, "m"),
        b: unit(1, "s")
      };
      expect(() => evaluate("a+b", scope)).toThrow("Units do not match");
      expect(() => evaluate("a-b", scope)).toThrow("Units do not match");
    });

    test("a unit-less value is added or subtracted from a value with a unit", () => {
      const scope = {
        a: 1,
        b: unit(1, "s")
      };
      expect(() => evaluate("a+b", scope)).toThrow("Unexpected type of argument");
      expect(() => evaluate("a-b", scope)).toThrow("Unexpected type of argument");
      expect(() => evaluate("b-a", scope)).toThrow("Unexpected type of argument");
    });
  });

  describe("our customizations", () => {

    it("handles '$'", () => {
      unitsManager.addUnit("$");
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(1, "m/$"),
        b: localMath.unit(1, "$")
      };
      const result = localMath.evaluate("a*b", scope);
      const simpl = result.simplify();
      expect(simpl.toString()).toEqual("1 m");
    });

    it("handles '_'", () => {
      unitsManager.addUnit("t_s");
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(1, "m/t_s"),
        b: localMath.unit(1, "t_s")
      };
      const result = localMath.evaluate("a*b", scope);
      const simpl = result.simplify();
      expect(simpl.toString()).toEqual("1 m");
    });

    // This section describes the valid variable characters:
    // https://mathjs.org/docs/expressions/syntax.html#constants-and-variables
    it("handles a valid variable which is an invalid unit", () => {
      unitsManager.addUnit("Ā");
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(1, "m")
      };
      const result = localMath.evaluate("a", scope);
      expect(result.toString()).toEqual("1 m");
    });

    it("handles an invalid variable", () => {
      unitsManager.addUnit("✔");
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(1, "m")
      };
      const result = localMath.evaluate("a", scope);
      expect(result.toString()).toEqual("1 m");
    });

    it("handles units with options", () => {
      unitsManager.addUnit("cat", { aliases: ["cats"]});
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(1, "cat"),
        b: localMath.unit(2, "cats")
      };
      const result = localMath.evaluate("a+b", scope);
      const simpl = result.simplify();
      expect(simpl.toString()).toEqual("3 cats");
    });

    it("shares units across math instances", () => {
      unitsManager.addUnit("bags");
      const localMath = createMath(unitsManager);
      const scope = {
        a: localMath.unit(2, "bags"),
        b: localMath.unit(3, "bags")
      };
      const result = localMath.evaluate("a+b", scope);
      const simpl = result.simplify();
      expect(simpl.toString()).toEqual("5 bags");

      const localMath2 = createMath(unitsManager);
      const result2 = localMath2.evaluate("a+b+4 bags", scope);
      const simpl2 = result2.simplify();
      expect(simpl2.toString()).toEqual("9 bags");
    });

  });
});
