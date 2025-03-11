export function InfoBox() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border-black">
        <p className="text-lg font-semibold mb-2 dark:text-white">No tables yet</p>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 ">
          Press 
          <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">
            Ctrl
          </kbd>
          <span className="text-sm text-gray-700 dark:text-gray-300">+</span>
          <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1  mx-1 rounded">
            E
          </kbd> 
          to create a new table
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Press 
          <kbd className="font-mono text-sm font-semibold bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">
            Delete
          </kbd> 
          to remove selected tables
        </p>
      </div>
    </div>
  );
}
