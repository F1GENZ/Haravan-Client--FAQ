import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const TinyEditor = ({ initialValue, onEditorChange }) => {
  const editorRef = useRef(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      init={{
        height: 500,
        menubar: "file edit",
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
        ],
        toolbar:
          "accordion accordionremove | blocks fontsize | bold italic underline strikethrough | align numlist bullist | outdent indent| link table hr charmap forecolor backcolor removeformat code",
        branding: false,
        paste_preprocess: (plugin, args) => {
          args.content = args.content.replace(/<img[^>]*>/gi, '');
        },
        paste_data_images: false
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default TinyEditor;
