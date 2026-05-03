import {
  ChangeEventHandler,
  FormEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from "react";
import clsx from "clsx";
import { observer } from "mobx-react-lite";
import { FileContext } from "App";
import { calculateExp } from "util/game";
import { getBitNodeSkillMult, getSf12Level } from "util/bitnode-mults";
import { parseInputNumber } from "util/format";
import { Bitburner } from "bitburner.types";

interface Props extends PropsWithChildren<{}> {
  property: Bitburner.PlayerStat;
  onSubmit(key: string, value: any): void;
}

export default observer(function StatSection({ property, onSubmit }: Props) {
  const { player } = useContext(FileContext);
  const data = player.data as any;

  // Bitburner v2 uses nested skills/exp/mults objects; v1 used flat keys
  const isV2 = !!data.skills;
  const currentLevel: number = isV2 ? (data.skills?.[property] ?? 0) : (data[property] ?? 0);
  // The skill formula uses the SKILL multiplier (mults.hacking), not the exp-gain multiplier (mults.hacking_exp)
  const skillMult: number = isV2
    ? (data.mults?.[property] ?? 1)
    : (data[`${property}_mult`] ?? 1);

  // BitNode multipliers reduce effective skill level — must be included in exp calculation
  const bitNodeN: number = data.bitNodeN ?? 1;
  const sf12Level = getSf12Level(data.sourceFiles);
  const bnMult = property === "intelligence" ? 1 : getBitNodeSkillMult(property, bitNodeN, sf12Level);

  const [value, setValue] = useState(`${currentLevel}`);

  const [editing, setEditing] = useState(false);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    setValue(event.currentTarget.value);
  }, []);

  const onClose = useCallback<MouseEventHandler<HTMLDivElement> & FormEventHandler>(
    (event) => {
      const desiredLevel = Math.min(Number.MAX_SAFE_INTEGER, parseInputNumber(value));
      const mult = property === "intelligence" ? 1 : skillMult * bnMult;
      const expValue = calculateExp(desiredLevel, mult);

      if (isV2) {
        onSubmit("skills", { ...data.skills, [property]: desiredLevel });
        onSubmit("exp", { ...data.exp, [property]: expValue });
      } else {
        onSubmit(`${property}_exp`, expValue);
        onSubmit(`${property}`, desiredLevel);
      }
      setValue(`${desiredLevel}`);
      setEditing(false);
      event.preventDefault();
    },
    [property, onSubmit, value, data, isV2, skillMult]
  );

  return (
    <>
      <form
        className="w-64 rounded border border-gray-700 shadow shadow-green-700"
        data-id="stat-section"
        data-property={property}
        onSubmit={onClose}
      >
        <label
          className={clsx(
            "h-full w-full relative inline-flex flex-col p-2 rounded hover:bg-gray-800 transition-colors duration-200 ease-in-out focus-within:bg-gray-800",
            editing && "z-20"
          )}
          onClick={!editing ? () => setEditing(true) : undefined}
        >
          <span className="text-xl font-bold text-gray-100 mb-1 capitalize">{property}</span>
          {!editing && <span className="overflow-hidden overflow-ellipsis">{currentLevel}</span>}
          {editing && (
            <>
              <div>
                <span>Level: </span>
                <input
                  className="bg-transparent px-2 py-1 rounded border-gray-800 hover:bg-gray-900 focus:bg-gray-900 outline-none"
                  value={value}
                  type="number"
                  onChange={onChange}
                />
              </div>
              <small className="mt-1 text-xs italic text-slate-500 px-2">
                Level calculation factors the BitNode multiplier (BN{bitNodeN}: {Math.round(bnMult * 100)}%), but not augmentations, so actual in-game levels may still vary
              </small>
            </>
          )}
        </label>
      </form>
      <div
        className={clsx(
          "z-10 absolute inset-0 bg-gray-900  transition-opacity duration-200 ease-in-out",
          editing ? "opacity-50" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
    </>
  );
});
