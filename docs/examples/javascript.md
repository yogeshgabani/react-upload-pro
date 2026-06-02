# Plain JavaScript example

```jsx
import { Dropzone, ThemeProvider } from 'react-upload-pro';
import 'react-upload-pro/styles.css';

export function App() {
  return (
    <ThemeProvider defaultTheme="auto">
      <Dropzone
        endpoint="/api/upload"
        accept="image/*,application/pdf"
        maxSize={10485760}
        onDrop={(accepted, rejected) => {
          console.log('accepted', accepted);
          console.log('rejected', rejected);
        }}
      />
    </ThemeProvider>
  );
}
```

## With render-prop

```jsx
import { Dropzone } from 'react-upload-pro';

export function CustomDropzone() {
  return (
    <Dropzone endpoint="/api/upload">
      {({ getRootProps, getInputProps, isDragAccept, files }) => (
        <div
          {...getRootProps()}
          className={isDragAccept ? 'border-green-500' : 'border-gray-300'}
          style={{ border: '2px dashed', padding: 32 }}
        >
          <input {...getInputProps()} />
          {files.length === 0
            ? 'Drop files here'
            : `${files.length} file(s) selected`}
        </div>
      )}
    </Dropzone>
  );
}
```
