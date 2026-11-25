import { Editor } from "@tinymce/tinymce-react";

const DESKTOP_TOOLBAR =
  "accordion accordionremove | blocks fontsize | bold italic underline strikethrough | align numlist bullist | outdent indent| link table hr charmap forecolor backcolor removeformat code";

// On a phone the full toolbar collapses to a single dropdown, so keep the controls that
// matter for writing an answer and let them wrap to a second row instead.
const COMPACT_TOOLBAR = "bold italic bullist numlist link | removeformat";

const DESKTOP_PLUGINS = [
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
];

const COMPACT_PLUGINS = ["autolink", "lists", "link", "charmap"];

const TinyEditor = ({ initialValue, onEditorChange, height = 360, compact = false }) => {
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      initialValue={initialValue}
      init={{
        height,
        menubar: compact ? false : "file edit",
        plugins: compact ? COMPACT_PLUGINS : DESKTOP_PLUGINS,
        toolbar: compact ? COMPACT_TOOLBAR : DESKTOP_TOOLBAR,
        toolbar_mode: compact ? "wrap" : "sliding",
        // The element path and resize handle only eat the phone screen; the dialog scrolls.
        statusbar: !compact,
        resize: !compact,
        branding: false,
        entity_encoding: "raw",
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
