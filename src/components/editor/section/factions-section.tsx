import {
  ChangeEvent,
  ChangeEventHandler,
  FormEventHandler,
  MouseEvent,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";
import { ascend, descend, path, sortWith } from "ramda";

import { FileContext } from "App";
import { Bitburner } from "bitburner.types";
import { Checkbox } from "components/inputs/checkbox";
import { Input } from "components/inputs/input";
import { formatNumber } from "util/format";
import { useDebounce } from "util/hooks";

import { BarsArrowUpIcon, BarsArrowDownIcon } from "@heroicons/react/24/solid";
import SearchIcon from "icons/search.svg?react";

export type FactionDataKey = keyof Bitburner.FactionView;

interface Props extends PropsWithChildren<{}> {
  isFiltering?: boolean;
}
export default observer(function FactionSection({ isFiltering }: Props) {
  const { factions } = useContext(FileContext);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [filters, setFilters] = useState<{ playerReputation?: number; favor?: number; alreadyInvited?: boolean; isMember?: boolean }>({
    playerReputation: -1,
  });

  const filteredFactions = useMemo(() => {
    const filteredFactions = factions.data.filter(([, faction]) => {
      return (
        (!filters.alreadyInvited || faction.alreadyInvited) &&
        (!filters.isMember || faction.isMember) &&
        (debouncedQuery.length === 0 || faction.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()) >= 0)
      );
    });

    // sort
    let sortProperty: keyof typeof filters = filters.playerReputation
      ? "playerReputation"
      : filters.favor
      ? "favor"
      : undefined;

    if (!sortProperty) return filteredFactions;

    return sortWith(
      [filters[sortProperty] > 0 ? ascend(path([1, sortProperty])) : descend(path([1, sortProperty]))],
      filteredFactions
    );
  }, [factions.data, filters, debouncedQuery]);

  const onSubmit = useCallback(
    (faction: string, updates: Partial<Bitburner.FactionView>) => {
      factions.updateFaction(faction, updates);
    },
    [factions]
  );

  const onEditFilters = useCallback((event: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.type === "checkbox") {
      const element = event.currentTarget as HTMLInputElement;
      const property = element.dataset.key;
      const checked = element.checked;

      setFilters((f) => ({
        ...f,
        [property]: checked,
      }));
    } else {
      const element = event.currentTarget as HTMLButtonElement;
      const property = element.dataset.key as keyof typeof filters;
      const otherProperty = property === "favor" ? "playerReputation" : "favor";

      setFilters((f) => ({
        ...f,
        [property]: !f[property] ? -1 : (f[property] as number) > 0 ? -1 : 1,
        [otherProperty]: undefined,
      }));
    }
  }, []);

  // @TODO: Add sorting
  return (
    <div>
      {isFiltering && (
        <>
          <div className="mb-4 flex gap-4">
            <label className="flex items-center">
              <SearchIcon className="h-6 w-6 text-slate-500" />
              <Input
                className="border-b border-green-900"
                onChange={(e) => setQuery(e.currentTarget.value)}
                value={query}
                type="text"
                placeholder="Search Factions..."
              />
            </label>
            <label className="inline-flex items-center text-slate-100">
              <Checkbox onChange={onEditFilters} data-key="alreadyInvited" checked={filters.alreadyInvited ?? false} />
              <span className="ml-2">Invited?</span>
            </label>
            <label className="inline-flex items-center text-slate-100">
              <Checkbox onChange={onEditFilters} data-key="isMember" checked={filters.isMember ?? false} />
              <span className="ml-2">Joined?</span>
            </label>
          </div>
          <div className="mb-4 flex gap-4">
            <button
              className={clsx("flex items-center justify-center", !filters.playerReputation && "opacity-25")}
              data-key="playerReputation"
              onClick={onEditFilters}
            >
              {filters.playerReputation > 0 ? (
                <BarsArrowUpIcon className="h-6 w-6" />
              ) : (
                <BarsArrowDownIcon className="h-6 w-6" />
              )}
              <span className="ml-2">Reputation</span>
            </button>
            <button
              className={clsx("flex items-center justify-center", !filters.favor && "opacity-25")}
              data-key="favor"
              onClick={onEditFilters}
            >
              {filters.favor > 0 ? (
                <BarsArrowUpIcon className="h-6 w-6" />
              ) : (
                <BarsArrowDownIcon className="h-6 w-6" />
              )}
              <span className="ml-2">Favor</span>
            </button>
          </div>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-flow-row gap-4">
        {filteredFactions.map(([faction, factionData]) => (
          <Faction key={faction} id={faction} faction={factionData} onSubmit={onSubmit} />
        ))}
      </div>
    </div>
  );
});

interface FactionProps extends PropsWithChildren<{}> {
  id: string;
  faction: Bitburner.FactionView;
  onSubmit(key: string, value: Partial<Bitburner.FactionView>): void;
}

const Faction = function Faction({ id, faction, onSubmit }: FactionProps) {
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState(Object.assign({}, faction));

  const onClickEnter = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
    setEditing(true);
    // So clicking into the box does not trigger checkboxes
    event.preventDefault();
  }, []);

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>((event) => {
    const { checked, dataset, type, value } = event.currentTarget;
    setState((s) => ({ ...s, [dataset.key]: type === "checkbox" ? checked : value }));
  }, []);

  const onClose = useCallback<FormEventHandler>(
    (event) => {
      // Process rep and favor
      const playerReputation = Math.min(Number.MAX_SAFE_INTEGER, Number(state.playerReputation));
      const favor = Math.min(Number.MAX_SAFE_INTEGER, Number(state.favor));

      onSubmit(id, {
        alreadyInvited: state.alreadyInvited,
        isMember: state.isMember,
        playerReputation,
        favor,
      });

      setEditing(false);
      event.preventDefault();
    },
    [id, state, onSubmit]
  );

  // @TODO: Display Augmentations
  return (
    <>
      <div
        className={clsx(
          "transition-colors duration-200 ease-in-out relative inline-flex flex-col p-2 rounded border shadow shadow-green-700 border-gray-700 hover:bg-gray-800  focus-within:bg-gray-800 row-span-2 h-10 overflow-hidden",
          editing && "z-20 h-auto"
        )}
        onClick={!editing ? onClickEnter : undefined}
      >
        <form className="grid grid-cols-3 gap-1" data-id="faction-section" onSubmit={onClose}>
          <header className="col-span-2 flex items-baseline justify-between">
            <h3 className="tracking-wide text-green-100">{faction.name}</h3>
          </header>
          <label className="ml-auto inline-flex items-center text-slate-100">
            <span className="mr-2 text-sm">Invited: </span>
            <Checkbox
              checked={state.alreadyInvited ?? false}
              disabled={!editing}
              onChange={onChange}
              data-key="alreadyInvited"
            />
          </label>
          <label className="col-span-2 flex items-center">
            <span className="mr-1">Reputation: </span>
            {editing && (
              <Input
                disabled={!editing}
                onChange={onChange}
                value={`${state.playerReputation}`}
                type="number"
                data-key="playerReputation"
              />
            )}
            {!editing && <p className="px-2 py-1 w-full">{formatNumber(state.playerReputation)}</p>}
          </label>
          <label className="ml-auto inline-flex items-center text-slate-100">
            <span className="mr-2 text-sm">Joined: </span>
            <Checkbox checked={state.isMember ?? false} disabled={!editing} onChange={onChange} data-key="isMember" />
          </label>
          <label className="col-span-2 flex items-center">
            <span className="mr-1">Favor: </span>
            {editing && (
              <Input disabled={!editing} onChange={onChange} value={`${state.favor}`} type="number" data-key="favor" />
            )}
            {!editing && <p className="px-2 py-1 w-full">{formatNumber(state.favor)}</p>}
          </label>
          <button type="submit" className="hidden" />
        </form>
      </div>
      <div
        className={clsx(
          "z-10 absolute inset-0 bg-gray-900  transition-opacity duration-200 ease-in-out",
          editing ? "opacity-50" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
    </>
  );
};
