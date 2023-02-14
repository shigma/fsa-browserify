declare global {
  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean
  }

  interface FileSystemWritableFileStream extends WritableStream {
    seek(position: number): Promise<void>
    truncate(size: number): Promise<void>
    write(data: string | ArrayBuffer | ArrayBufferView | Blob | DataView): Promise<void>
  }

  interface FileSystemReadWriteOptions {
    at: number
  }

  interface FileSystemSyncAccessHandle {
    close(): Promise<void>
    flush(): Promise<void>
    getSize(): Promise<number>
    read(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): Promise<number>
    truncate(newSize: number): Promise<void>
    write(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): Promise<number>
  }

  interface FileSystemFileHandle {
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>
    createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>
  }

  interface FileSystemDirectoryHandle {
    entries(): AsyncIterable<[string, FileSystemHandle]>
    keys(): AsyncIterable<string>
    values(): AsyncIterable<FileSystemHandle>
  }
}

export async function writeFile(path: string, data: string, options: BufferEncoding) {
  let root = await navigator.storage.getDirectory()
  const segments = path.split('/').filter(Boolean)
  const filename = segments.pop()!
  for (const segment of segments) {
    root = await root.getDirectoryHandle(segment, { create: true })
  }
  const fileHandle = await root.getFileHandle(filename, { create: true })
  const stream = await fileHandle.createWritable()
  await stream.write(new TextEncoder().encode(data))
  await stream.close()
}

export async function readFile(path: string, options: BufferEncoding) {
  let root = await navigator.storage.getDirectory()
  const segments = path.split('/').filter(Boolean)
  const filename = segments.pop()!
  for (const segment of segments) {
    root = await root.getDirectoryHandle(segment)
  }
  const fileHandle = await root.getFileHandle(filename)
  const stream = await fileHandle.getFile()
  const data = await stream.text()
  return data
}

export async function readdir(path: string) {
  let root = await navigator.storage.getDirectory()
  const segments = path.split('/').filter(Boolean)
  for (const segment of segments) {
    root = await root.getDirectoryHandle(segment)
  }
  const results: string[] = []
  for await (const name of root.keys()) {
    results.push(name)
  }
  return results
}

export interface MakeDirectoryOptions {
  recursive?: boolean
}

export async function mkdir(path: string, options: MakeDirectoryOptions) {
  let root = await navigator.storage.getDirectory()
  const segments = path.split('/').filter(Boolean)
  for (const segment of segments) {
    root = await root.getDirectoryHandle(segment, { create: true })
  }
}

export async function unlink(path: string) {
  let root = await navigator.storage.getDirectory()
  const segments = path.split('/').filter(Boolean)
  const filename = segments.pop()!
  for (const segment of segments) {
    root = await root.getDirectoryHandle(segment)
  }
  await root.removeEntry(filename)
}
