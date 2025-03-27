import { HandIcon, PlusSquare, Trash2, Table2 } from 'lucide-react';

export function InfoBox() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-left p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border-black max-w-md">
        <div className="flex items-center mb-4">
          <Table2 className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          <p className="text-lg font-semibold ml-2 dark:text-white">No tables yet</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 select-none">
            <span className="flex items-center">
              <PlusSquare className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              Press
              <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">
                Ctrl
              </kbd>
              <span className="text-sm text-gray-700 dark:text-gray-300">+</span>
              <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">
                E
              </kbd>
              to create a new table
            </span>
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 select-none">
            <span className="flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              Press
              <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">
                Delete
              </kbd>
              to remove selected tables
            </span>
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 select-none">
            <span className="flex items-center">
              <HandIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              Hold for a long press to activate actions on mobile devices.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
