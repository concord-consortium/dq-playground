import React, { useState } from "react";
import { VariableType } from "../models/variable";
import { kMaxNameCharacters, kMaxNotesCharacters } from "../utils/validate";

import "./dialog.scss";

interface INormalDialogRow {
  label: string;
  maxCharacters?: number;
  value: string;
  setValue: (value: string) => void;
}
const NormalDialogRow = ({ label, maxCharacters, value, setValue }: INormalDialogRow) => {
  return (
    <div className="normal-dialog-row">
      <label className="dialog-label" htmlFor={label}>
        {label}
      </label>
      <input
        className="dialog-input"
        id={label}
        type="text"
        maxLength={maxCharacters}
        value={value}
        onChange={e => setValue(e.target.value)}
        dir="auto"
      />
    </div>
  );
};

interface IEditVariableDialogContent {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  unit: string;
  setUnit: React.Dispatch<React.SetStateAction<string>>;
}
export const EditVariableDialogContent = ({ name, setName, notes, setNotes, value, setValue, unit, setUnit }: IEditVariableDialogContent) => {
  return (
    <div className="dialog-content">
      <div>Edit Variable:</div>
      <NormalDialogRow label="Name" value={name} setValue={setName} maxCharacters={kMaxNameCharacters} />
      <NormalDialogRow label="Notes" value={notes} setValue={setNotes} maxCharacters={kMaxNotesCharacters} />
      <NormalDialogRow label="Units" value={unit} setValue={setUnit} />
      <NormalDialogRow label="Value" value={value} setValue={setValue} />
    </div>
  );
};

interface IUpdateVariable {
  variable: VariableType;
  name?: string;
  notes?: string;
  value?: string;
  unit?: string;
}
export const updateVariable = ({ variable, name, notes, value, unit}: IUpdateVariable) => {
  if (name) variable.setName(name);
  if (notes) variable.setDescription(notes);
  if (value) variable.setValue(+value);
  if (unit) variable.setUnit(unit);
};

interface IEditVariableDialog {
  onClose: () => void;
  onSave: (updates: IUpdateVariable) => void;
  variable: VariableType;
}
export const EditVariableDialog = ({ onClose, onSave, variable }: IEditVariableDialog) => {
  const [name, setName] = useState(variable.name || "");
  const [notes, setNotes] = useState(variable.description || "");
  const [value, setValue] = useState(variable.value?.toString() || "");
  const [unit, setUnit] = useState(variable.unit || "");

  const handleOK = () => {
    onSave({ variable, name, notes, value, unit });
    onClose();
  };

  return (
    <div className="qp-dialog">
      <EditVariableDialogContent
        name={name} setName={setName}
        notes={notes} setNotes={setNotes}
        value={value} setValue={setValue}
        unit={unit} setUnit={setUnit}
      />
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleOK}>OK</button>
    </div>
  );
};
