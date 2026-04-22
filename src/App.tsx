import { createContext, useContext } from "react";
import { observer } from "mobx-react-lite";

import FileLoader from "components/file-loader";
import Editor from "components/editor";
import fileStore from "store/file.store";
import type { FileStore } from "store/file.store";
import MatrixRain from "components/matrix-rain";

import DownloadIcon from "icons/download.svg?react";

export const FileContext = createContext<FileStore>(fileStore);

function App() {
  const fileStore = useContext(FileContext);

  return (
    <FileContext.Provider value={fileStore}>
      <MatrixRain />
      <div className="flex flex-col h-full w-full" style={{ position: "relative", zIndex: 1 }}>
        <header>
          <h1 className="flex items-center text-4xl mb-4 text-green-400 tracking-widest uppercase">
            Bitburner Save Editor v2
            {fileStore.ready && (
              <button className="ml-4 p-2 rounded border border-green-700 bg-gray-900 hover:bg-gray-800 hover:shadow-neon transition-all" onClick={fileStore.downloadFile}>
                <DownloadIcon className="h-8 w-8 text-green-400" />
              </button>
            )}
            <a
              href="https://github.com/Marcinator2/bitburner-save-editor-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 text-sm font-normal tracking-normal text-green-500 hover:text-green-300 border border-green-700 hover:border-green-400 px-4 py-2 rounded transition-colors hover:shadow-neon"
            >
              GitHub
            </a>
          </h1>
          <FileLoader />
        </header>
        <Editor />
      </div>
    </FileContext.Provider>
  );
}

export default observer(App);
