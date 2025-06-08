import type { QRL, Signal } from "@builder.io/qwik";
import {
  $,
  component$,
  useOnDocument,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons";
import type { TechnicianResponse } from "~/types";

interface TechMultiSelectProps {
  technicians: TechnicianResponse[];
  selectedTechnicians: Signal<TechnicianResponse[]>;
}

const useTechMultiSelectState = () => {
  const search = useSignal("");
  const selectedIds = useSignal<string[]>([]);
  const dropdownOpen = useSignal(false);
  const filteredTechs = useSignal<TechnicianResponse[]>([]);

  return { search, selectedIds, dropdownOpen, filteredTechs };
};

export const TechMultiSelect = component$(
  ({ technicians, selectedTechnicians }: TechMultiSelectProps) => {
    const { search, selectedIds, dropdownOpen, filteredTechs } =
      useTechMultiSelectState();

    // Initialize selectedIds with all technicians on DOM load
    useOnDocument(
      "DOMContentLoaded",
      $(() => {
        selectedIds.value = technicians.map((tech) => tech.id);
      }),
    );

    // Filter technicians based on search input
    useTask$(({ track }) => {
      track(() => search.value);
      const searchTerm = search.value.toLowerCase();
      filteredTechs.value = technicians.filter((tech) =>
        tech.name.toLowerCase().includes(searchTerm),
      );
    });

    // Update selectedTechnicians when selectedIds changes
    useTask$(({ track }) => {
      track(() => selectedIds.value);
      selectedTechnicians.value = technicians.filter((tech) =>
        selectedIds.value.includes(tech.id),
      );
    });

    const toggleSelection = $((id: string) => {
      selectedIds.value = selectedIds.value.includes(id)
        ? selectedIds.value.filter((x) => x !== id)
        : [...selectedIds.value, id];
    });

    const removeSelected = $((id: string) => {
      selectedIds.value = selectedIds.value.filter((x) => x !== id);
    });

    const handleBlur = $(() => {
      setTimeout(() => {
        dropdownOpen.value = false;
      }, 200);
    });

    return (
      <div class="card bg-base-200 shadow-md w-full">
        <div class="card-body">
          <h2 class="card-title text-xl font-bold">Technicians</h2>

          <Dropdown
            search={search}
            filteredTechs={filteredTechs}
            selectedIds={selectedIds}
            onBlur={handleBlur}
            onToggleSelect={toggleSelection}
          />

          <SelectedTechnicians
            selectedTechnicians={selectedTechnicians.value}
            onRemove={removeSelected}
          />
        </div>
      </div>
    );
  },
);

interface DropdownProps {
  search: Signal<string>;
  filteredTechs: Signal<TechnicianResponse[]>;
  selectedIds: Signal<string[]>;
  onBlur: QRL<() => void>;
  onToggleSelect: QRL<(id: string) => void>;
}

const Dropdown = component$(({
  search,
  filteredTechs,
  selectedIds,
  onBlur,
  onToggleSelect
}: DropdownProps) => {
  return (
    <div class="dropdown">
      {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
      <div tabIndex={0} role="button">
        <label class="input">
          <input
            type="text"
            class="grow"
            placeholder="Search technicians..."
            bind:value={search}
            onBlur$={onBlur}
          />
          <HiChevronDownSolid />
        </label>
      </div>

      <ul
        // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
        tabIndex={0}
        class="dropdown-content menu bg-base-100 rounded-box z-1 w-72 p-2 shadow-sm"
      >
        {filteredTechs.value.length === 0 ? (
          <NoTechniciansFound />
        ) : (
          filteredTechs.value.map((tech) => (
            <TechListItem
              key={tech.id}
              tech={tech}
              isSelected={selectedIds.value.includes(tech.id)}
              onToggleSelect={onToggleSelect}
            />
          ))
        )}
      </ul>
    </div>
  );
});

const NoTechniciansFound = component$(() => (
  <div class="p-2 text-sm text-gray-500">
    No technicians found
  </div>
));

interface TechListItemProps {
  tech: TechnicianResponse;
  isSelected: boolean;
  onToggleSelect: QRL<(id: string) => void>;
}

const TechListItem = component$(({ tech, isSelected, onToggleSelect }: TechListItemProps) => (
  <label class="flex items-start gap-2 p-2 hover:bg-base-200 cursor-pointer">
    <input
      type="checkbox"
      class="checkbox checkbox-sm mt-1"
      checked={isSelected}
      onChange$={() => onToggleSelect(tech.id)}
    />
    <div>
      <div class="font-semibold">{tech.name}</div>
      <div class="text-sm text-gray-500">{tech.email}</div>
      <div class="text-xs text-gray-400">{tech.role}</div>
    </div>
  </label>
));

interface SelectedTechniciansProps {
  selectedTechnicians: TechnicianResponse[];
  onRemove: QRL<(id: string) => void>;
}

const SelectedTechnicians = component$(({ selectedTechnicians, onRemove }: SelectedTechniciansProps) => {
  if (selectedTechnicians.length === 0) return null;

  return (
    <div class="mt-4">
      <div class="flex flex-wrap gap-2">
        {selectedTechnicians.map((tech) => (
          <SelectedTechBadge
            key={tech.id}
            tech={tech}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
});

interface SelectedTechBadgeProps {
  tech: TechnicianResponse;
  onRemove: QRL<(id: string) => void>;
}

const SelectedTechBadge = component$(({ tech, onRemove }: SelectedTechBadgeProps) => (
  <div class="badge badge-soft badge-accent gap-1">
    {tech.name}
    <button
      type="button"
      class="ml-1 text-error hover:text-red-700"
      onClick$={() => onRemove(tech.id)}
    >
      ✕
    </button>
  </div>
));
