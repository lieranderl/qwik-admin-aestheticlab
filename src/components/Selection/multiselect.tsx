import { $, component$, useOnDocument, useSignal, useTask$ } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { TechnicianResponse } from "~/types";
import { HiChevronDownSolid } from "@qwikest/icons/heroicons"


interface Props {
  technicians: TechnicianResponse[];
  selectedTechnicians: Signal<TechnicianResponse[]>;
}

export const TechMultiSelect = component$(({ technicians, selectedTechnicians }: Props) => {
  const search = useSignal('');
  const selectedIds = useSignal<string[]>([]);
  const dropdownOpen = useSignal(false);
  const filteredTechs = useSignal<TechnicianResponse[]>([]);


  useOnDocument("DOMContentLoaded", $(() => {
    selectedIds.value = technicians.map((tech) => tech.id);
  }))

  useTask$(({ track }) => {
    track(() => search.value);
    filteredTechs.value = technicians.filter((tech) =>
      tech.name.toLowerCase().includes(search.value.toLowerCase())
    );
  });

  useTask$(({ track }) => {
    track(() => selectedIds.value);
    selectedTechnicians.value = technicians.filter((tech) =>
      selectedIds.value.includes(tech.id)
    );
  });

  const toggleSelect = $((id: string) => {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((x) => x !== id);
    } else {
      selectedIds.value = [...selectedIds.value, id];
    }
  });

  const removeSelected = $((id: string) => {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  });

  return (
    <div class="card bg-base-200 shadow-md w-full">
      <div class="card-body">
        <h2 class="card-title text-xl font-bold">Technicians</h2>
        <div class="dropdown">
          <div tabIndex={0} role="button" >

            <label class="input">
              <input type="text" class="grow" placeholder="Search technicians..." bind:value={search}
                onBlur$={() => setTimeout(() => (dropdownOpen.value = false), 200)} />
              <HiChevronDownSolid />
            </label>



          </div>

          <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-1 w-72 p-2 shadow-sm">
            {filteredTechs.value.length === 0 ? (
              <div class="p-2 text-sm text-gray-500">No technicians found</div>
            ) : (
              filteredTechs.value.map((tech) => (
                <label
                  key={tech.id}
                  class="flex items-start gap-2 p-2 hover:bg-base-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm mt-1"
                    checked={selectedIds.value.includes(tech.id)}
                    onChange$={() => toggleSelect(tech.id)}
                  />
                  <div>
                    <div class="font-semibold">{tech.name}</div>
                    <div class="text-sm text-gray-500">{tech.email}</div>
                    <div class="text-xs text-gray-400">{tech.role}</div>
                  </div>
                </label>
              ))
            )}
          </ul>


        </div>


        {selectedTechnicians.value.length > 0 && (
          <div class="mt-4">
            <div class="flex flex-wrap gap-2">
              {selectedTechnicians.value.map((tech) => (
                <div key={tech.id} class="badge badge-soft badge-accent gap-1">
                  {tech.name}
                  <button
                    type="button"
                    class="ml-1 text-error hover:text-red-700"
                    onClick$={() => removeSelected(tech.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
