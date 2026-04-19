import { ChangeEventHandler, DragEventHandler, useCallback, useContext, useState } from "react";
import { FileContext } from "../App";

import UploadIcon from "icons/upload.svg?react";
import { observer } from "mobx-react-lite";
import clsx from "clsx";

export default observer(function FileLoader() {
  const fileContext = useContext(FileContext);
  const [isDragging, setIsDragging] = useState(false);

  const onSelectFile = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async (event) => {
      const { files } = event.currentTarget;
      await fileContext.uploadFile(files[0]);
    },
    [fileContext]
  );

  const onDrop = useCallback<DragEventHandler<HTMLLabelElement>>(
    async (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) await fileContext.uploadFile(file);
    },
    [fileContext]
  );

  const onDragOver = useCallback<DragEventHandler<HTMLLabelElement>>((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback<DragEventHandler<HTMLLabelElement>>(() => {
    setIsDragging(false);
  }, []);

  return (
    <label
      className={clsx(
        "inline-flex items-center rounded py-2 px-8 bg-gray-800 cursor-pointer transition-colors",
        isDragging && "ring-2 ring-green-400 bg-gray-700"
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <UploadIcon className="h-8 w-8 mr-4" />
      {fileContext.file?.name ?? "Choose File"}
      <input className="hidden" type="file" accept="application/json" onChange={onSelectFile} />
    </label>
  );
});
