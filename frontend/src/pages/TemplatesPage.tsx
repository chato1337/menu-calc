import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import CustomEditor from "../ckeditor/ckeditor";
import { createTemplate, deleteTemplate, listTemplates, updateTemplate } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { Template, TemplatePayload } from "../types/domain";

const LIMIT = 10;

type CkEditorInstance = {
  model: {
    change: (callback: (writer: {
      createText: (value: string) => unknown;
      createElement: (type: string, attrs?: Record<string, string>) => unknown;
    }) => void) => void;
    insertContent: (content: unknown, selection: unknown) => void;
    document: { selection: unknown };
  };
  getData: () => string;
  setData: (data: string) => void;
  execute: (command: string, options?: { source?: string }) => void;
  editing?: { view?: { focus?: () => void } };
};

const TEMPLATE_VARIABLES = [
  "{{cantidad}}",
  "{{nombre_producto}}",
  "{{unidad}}",
  "{{categoria}}",
  "{{fecha}}",
  "{{nombre_orden}}",
  "{{tabla_productos}}",
];

export function TemplatesPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Template | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editorInstance, setEditorInstance] = useState<CkEditorInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(() => ["templates", LIMIT, offset], [offset]);
  const { data, isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => listTemplates({ limit: LIMIT, offset }),
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
  const getErrorMessage = (mutationError: unknown) =>
    mutationError instanceof Error ? mutationError.message : t("notifications.genericError");

  const createMutation = useMutation({
    mutationFn: (payload: TemplatePayload) => createTemplate(payload),
    onError: (mutationError) => {
      showSnackbar(getErrorMessage(mutationError), "error");
    },
    onSuccess: refresh,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TemplatePayload }) => updateTemplate(id, payload),
    onError: (mutationError) => {
      showSnackbar(getErrorMessage(mutationError), "error");
    },
    onSuccess: async () => {
      resetForm();
      await refresh();
      showSnackbar(t("notifications.updated"), "success");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onError: (mutationError) => {
      showSnackbar(getErrorMessage(mutationError), "error");
    },
    onSuccess: async (_, deletedId) => {
      if (editing?.id === deletedId) {
        resetForm();
      }
      await refresh();
    },
  });

  function resetForm() {
    setEditing(null);
    setTitle("");
    setContent("");
    setError(null);
  }

  function insertVariable(token: string) {
    if (!editorInstance) {
      setContent((prev) => `${prev}${token}`);
      return;
    }
    editorInstance.model.change((writer) => {
      const textNode = writer.createText(token);
      editorInstance.model.insertContent(textNode, editorInstance.model.document.selection);
    });
    setContent(editorInstance.getData());
  }

  function insertImageByUrl() {
    const imageUrl = window.prompt(t("templatesPage.imageUrlPrompt"))?.trim();
    if (!imageUrl) return;
    const isValidHttpUrl = /^https?:\/\/\S+$/i.test(imageUrl);
    if (!isValidHttpUrl) {
      showSnackbar(t("templatesPage.errors.invalidImageUrl"), "error");
      return;
    }
    if (editorInstance) {
      try {
        editorInstance.editing?.view?.focus?.();
        editorInstance.model.change((writer) => {
          const imageElement = writer.createElement("imageBlock", { src: imageUrl }) as unknown;
          editorInstance.model.insertContent(imageElement, editorInstance.model.document.selection);
        });
        setContent(editorInstance.getData());
      } catch (err) {
        showSnackbar(t("templatesPage.errors.invalidImageUrl"), "error");
      }
    } else {
      const nextData = `${content}<p><img src="${imageUrl}" alt="" /></p>`;
      setContent(nextData);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError(t("templatesPage.errors.titleRequired"));
      return;
    }
    if (!content.trim()) {
      setError(t("templatesPage.errors.contentRequired"));
      return;
    }

    const payload: TemplatePayload = {
      title: title.trim(),
      content,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        resetForm();
        showSnackbar(t("notifications.created"), "success");
      },
    });
  }

  function onEdit(template: Template) {
    setEditing(template);
    setTitle(template.title);
    setContent(template.content);
    setError(null);
  }

  function onDelete(templateId: number) {
    deleteMutation.mutate(templateId);
  }

  function onPrint(template: Template) {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin: 0 0 16px 0; font-size: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            img { max-width: 100%; height: auto; }
            figure.image.image_resized { display: block; box-sizing: border-box; }
            figure.image.image_resized img { width: 100%; }
          </style>
        </head>
        <body>
          <h1>${template.title}</h1>
          <div>${template.content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();

    const doPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    const imgs = printWindow.document.querySelectorAll("img");
    const loadPromises = Array.from(imgs).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    );

    if (loadPromises.length === 0) {
      doPrint();
    } else {
      Promise.race([
        Promise.all(loadPromises),
        new Promise((r) => setTimeout(r, 5000)),
      ]).then(doPrint);
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("templatesPage.title")}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t("templatesPage.description")}
      </Typography>

      <Stack component="form" spacing={1.5} onSubmit={onSubmit}>
        <TextField
          size="small"
          label={t("templatesPage.templateTitle")}
          placeholder={t("templatesPage.templateTitlePlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {TEMPLATE_VARIABLES.map((token) => (
            <Chip key={token} label={token} variant="outlined" onClick={() => insertVariable(token)} />
          ))}
        </Stack>

        <Stack direction="row">
          <Button size="small" variant="outlined" startIcon={<ImageIcon />} onClick={insertImageByUrl}>
            {t("templatesPage.insertImageByUrl")}
          </Button>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            "& .ck-editor__editable_inline": {
              minHeight: "400px",
              resize: "vertical",
              overflowY: "auto",
            },
          }}
        >
          <CKEditor
            editor={CustomEditor as any}
            data={content}
            config={{
              toolbar: [
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
              fontSize: {
                options: [10, 12, 14, "default", 18, 20, 24],
                supportAllValues: true,
              },
              fontFamily: {
                options: [
                  "default",
                  "Arial, Helvetica, sans-serif",
                  "Georgia, serif",
                  "Times New Roman, Times, serif",
                  "Verdana, Geneva, sans-serif",
                ],
                supportAllValues: true,
              },
              table: {
                contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
              },
            }}
            onReady={(editor: unknown) => {
              setEditorInstance(editor as CkEditorInstance);
            }}
            onChange={(_, editor) => {
              setContent(editor.getData());
              if (error) setError(null);
            }}
          />
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack direction="row" spacing={1}>
          <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
            {editing ? t("common.update") : t("common.create")}
          </Button>
          {editing ? (
            <Button variant="outlined" type="button" onClick={resetForm}>
              {t("common.cancel")}
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {queryError instanceof Error ? <Alert severity="error">{queryError.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.results ?? []).map((template) => (
              <TableRow key={template.id} selected={editing?.id === template.id}>
                <TableCell>{template.id}</TableCell>
                <TableCell>{template.title}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => onEdit(template)} startIcon={<EditIcon />}>
                      {t("common.edit")}
                    </Button>
                    <Button size="small" onClick={() => onPrint(template)} startIcon={<PrintIcon />}>
                      {t("templatesPage.print")}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete(template.id)}
                      startIcon={<DeleteIcon />}
                    >
                      {t("common.delete")}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {(data?.results ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Box py={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t("templatesPage.emptyState")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <PaginationControls
        total={data?.count ?? 0}
        limit={LIMIT}
        offset={offset}
        onPrev={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
        onNext={() => setOffset((prev) => prev + LIMIT)}
      />
    </Stack>
  );
}
