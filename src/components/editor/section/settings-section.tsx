import { useCallback, useContext } from "react";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";

export default observer(function SettingsSection() {
  const { settings } = useContext(FileContext);

  const onChange = useCallback(
    (key: string, rawValue: string, originalType: string) => {
      let value: unknown = rawValue;
      if (originalType === "boolean") value = rawValue === "true";
      else if (originalType === "number") value = Number(rawValue);
      settings.updateSetting(key, value);
    },
    [settings]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(settings.data).map(([key, val]) => {
        const type = typeof val;
        if (type === "object" || type === "undefined") return null;

        return (
          <div
            key={key}
            className="rounded border border-gray-700 shadow shadow-green-700 p-3 flex flex-col gap-1"
          >
            <span className="text-sm font-bold text-gray-100">{key}</span>
            {type === "boolean" ? (
              <select
                className="bg-gray-800 rounded px-2 py-1 outline-none focus:ring-1 ring-green-700"
                value={String(val)}
                onChange={(e) => onChange(key, e.currentTarget.value, type)}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                className="bg-transparent rounded border border-gray-600 px-2 py-1 outline-none focus:border-green-700"
                type={type === "number" ? "number" : "text"}
                value={String(val)}
                onChange={(e) => onChange(key, e.currentTarget.value, type)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
