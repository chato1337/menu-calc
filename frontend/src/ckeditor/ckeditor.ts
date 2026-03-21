import { ClassicEditor as ClassicEditorBase } from "@ckeditor/ckeditor5-editor-classic";
import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import { Bold, Italic, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { Font } from "@ckeditor/ckeditor5-font";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Image, ImageInsertViaUrl, ImageResize, ImageToolbar } from "@ckeditor/ckeditor5-image";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { Link } from "@ckeditor/ckeditor5-link";
import { List } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { Table, TableColumnResize, TableToolbar } from "@ckeditor/ckeditor5-table";
import { TextTransformation } from "@ckeditor/ckeditor5-typing";

export default class CustomEditor extends ClassicEditorBase {}

(CustomEditor as any).builtinPlugins = [
  Essentials,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Heading,
  Indent,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TextTransformation,
  Alignment,
  Font,
  Image,
  ImageInsertViaUrl,
  ImageResize,
  ImageToolbar,
];

(CustomEditor as any).defaultConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "alignment",
      "|",
      "fontSize",
      "fontFamily",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "outdent",
      "indent",
      "|",
      "link",
      "insertTable",
      "blockQuote",
      "|",
      "undo",
      "redo",
    ],
  },
  fontSize: {
    options: [10, 12, 14, "default", 18, 20, 24],
    supportAllValues: true,
  },
  fontFamily: {
    options: [
      "default",
      "Arial, Helvetica, sans-serif",
      "Courier New, Courier, monospace",
      "Georgia, serif",
      "Lucida Sans Unicode, Lucida Grande, sans-serif",
      "Tahoma, Geneva, sans-serif",
      "Times New Roman, Times, serif",
      "Trebuchet MS, Helvetica, sans-serif",
      "Verdana, Geneva, sans-serif",
    ],
    supportAllValues: true,
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  image: {
    insert: {
      integrations: ["insertImageViaUrl"],
    },
    toolbar: ["imageTextAlternative"],
    resizeUnit: "px",
  },
  language: "es",
};
