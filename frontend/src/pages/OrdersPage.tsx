import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PrintIcon from "@mui/icons-material/Print";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
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
import { useTranslation } from "react-i18next";

import { deleteOrder, getDaysForSelection, generateOrder, getOrders } from "../api/orders";
import { listProducts, listTemplates } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { GenerateOrderPayload, Order, Template } from "../types/domain";

const LIMIT = 10;

export function OrdersPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const printableContentRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<GenerateOrderPayload>({
    name: "",
    date: "",
    day_ids: [],
    product_category: "",
    template_id: null,
  });

  const queryKey = useMemo(() => ["orders", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getOrders({ limit: LIMIT, offset }),
  });

  const { data: days } = useQuery({
    queryKey: ["days", "selector"],
    queryFn: () => getDaysForSelection(),
  });
  const { data: productCategoriesData } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: () => listProducts({ limit: 200, offset: 0 }),
  });
  const { data: templatesData } = useQuery({
    queryKey: ["templates", "selector"],
    queryFn: () => listTemplates({ limit: 200, offset: 0 }),
  });
  const productCategories = useMemo(
    () =>
      Array.from(
        new Set(
          (productCategoriesData?.results ?? [])
            .map((item) => item.category.trim())
            .filter((category) => category !== "")
        )
      ).sort((a, b) => a.localeCompare(b)),
    [productCategoriesData]
  );
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const generateMutation = useMutation({
    mutationFn: (payload: GenerateOrderPayload) => generateOrder(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSnackbar(t("notifications.orderGenerated"), "success");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async (_, deletedOrderId) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setPreviewOrder((prev) => (prev?.id === deletedOrderId ? null : prev));
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.template_id) {
      showSnackbar(t("ordersPage.templateRequiredError"), "error");
      return;
    }
    generateMutation.mutate({
      ...form,
      template_id: form.template_id,
      product_category: form.product_category?.trim() ? form.product_category : undefined,
    });
  }

  function resetForm() {
    setForm({
      name: "",
      date: "",
      day_ids: [],
      product_category: "",
      template_id: null,
    });
  }

  function toggleDay(dayId: number) {
    setForm((prev) => ({
      ...prev,
      day_ids: prev.day_ids.includes(dayId)
        ? prev.day_ids.filter((id) => id !== dayId)
        : [...prev.day_ids, dayId],
    }));
  }

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function replaceAllTokens(content: string, token: string, value: string): string {
    const pattern = new RegExp(`\\{\\{\\s*${token}\\s*\\}\\}`, "gi");
    return content.replace(pattern, value);
  }

  function buildProductsTableHtml(order: Order): string {
    const rows = order.products
      // .map(
      //   (product) => `
      //     <tr>
      //       <td>${escapeHtml(product.name)}</td>
      //       <td>${escapeHtml(product.quantity)}</td>
      //       <td>${escapeHtml(product.unit_of_measure)}</td>
      //       <td>${escapeHtml(product.package_type)}</td>
      //       <td>${product.total}</td>
      //       <td>${product.qty_package}</td>
      //     </tr>
      //   `
      // )
      .map(
        (product) => `
          <tr>
            <td>${product.package_type}</td>
            <td>${escapeHtml(product.unit_of_measure)}</td>
            <td>${product.qty_package}</td>
            <td>${escapeHtml(product.name)}</td>
            <td></td>
            <td></td>
          </tr>
        `
      )
      .join("");

    return `
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("ordersPage.packageQuantity"))}</th>
            <th>${escapeHtml(t("common.unit"))}</th>
            <th>${escapeHtml(t("common.quantity"))}</th>
            <th>${escapeHtml(t("common.product"))}</th>
            <th>${escapeHtml(t("ordersPage.unitValue"))}</th>
            <th>${escapeHtml(t("ordersPage.totalValue"))}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderOrderTemplate(order: Order, template: Template): string {
    const productNames = order.products.map((product) => escapeHtml(product.name)).join("<br/>");
    const quantities = order.products.map((product) => escapeHtml(product.quantity)).join("<br/>");
    const units = order.products.map((product) => escapeHtml(product.unit_of_measure)).join("<br/>");
    const categories = order.products.map(() => "-").join("<br/>");
    const productsTable = buildProductsTableHtml(order);

    let rendered = template.content;
    rendered = replaceAllTokens(rendered, "nombre_orden", escapeHtml(order.name));
    rendered = replaceAllTokens(rendered, "fecha", escapeHtml(order.date));
    rendered = replaceAllTokens(rendered, "nombre_producto", productNames);
    rendered = replaceAllTokens(rendered, "cantidad", quantities);
    rendered = replaceAllTokens(rendered, "unidad", units);
    rendered = replaceAllTokens(rendered, "categoria", categories);
    rendered = replaceAllTokens(rendered, "tabla_productos", productsTable);
    return rendered;
  }

  function getRenderedOrderTemplate(order: Order): string | null {
    if (!order.template) {
      showSnackbar(t("ordersPage.printMissingTemplate"), "error");
      return null;
    }
    const selectedTemplate = (templatesData?.results ?? []).find((template) => template.id === order.template);
    if (!selectedTemplate) {
      showSnackbar(t("ordersPage.printTemplateNotFound"), "error");
      return null;
    }

    return renderOrderTemplate(order, selectedTemplate);
  }

  function openOrderPreview(order: Order) {
    const renderedContent = getRenderedOrderTemplate(order);
    if (!renderedContent) return;

    setPreviewOrder(order);
    setPreviewContent(renderedContent);
  }

  function printHtml(title: string, htmlContent: string) {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1, h2, h3 { margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            img { max-width: 100%; height: auto; }
            figure.image.image_resized { display: block; box-sizing: border-box; }
            figure.image.image_resized img { width: 100%; }
          </style>
        </head>
        <body>${htmlContent}</body>
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

  function printOrderPreview() {
    if (!previewOrder) return;

    printHtml(previewOrder.name, printableContentRef.current?.innerHTML ?? previewContent);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("ordersPage.title")}</Typography>

      <Stack component="form" onSubmit={onSubmit} spacing={1.5}>
        <TextField
          size="small"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          label={t("ordersPage.orderName")}
          placeholder={t("ordersPage.orderNamePlaceholder")}
          required
        />
        <TextField
          size="small"
          type="date"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          label={t("common.date")}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          select
          size="small"
          value={form.template_id ?? ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              template_id: e.target.value === "" ? null : Number(e.target.value),
            }))
          }
          label={t("ordersPage.templateLabel")}
          required
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="" disabled>
            {t("ordersPage.templatePlaceholder")}
          </MenuItem>
          {(templatesData?.results ?? []).map((template) => (
            <MenuItem key={template.id} value={template.id}>
              {template.title}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={form.product_category ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, product_category: e.target.value }))}
          label={t("ordersPage.productCategoryLabel")}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">{t("ordersPage.allCategories")}</MenuItem>
          {productCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
          {(days ?? []).map((day) => (
            <FormControlLabel
              key={day.id}
              control={
                <Checkbox
                checked={form.day_ids.includes(day.id)}
                onChange={() => toggleDay(day.id)}
                />
              }
              label={day.name}
            />
          ))}
        </Stack>
        <Button type="submit" variant="contained" disabled={generateMutation.isPending}>
          {generateMutation.isPending ? t("ordersPage.generating") : t("ordersPage.generateOrder")}
        </Button>
      </Stack>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.date")}</TableCell>
              <TableCell>{t("ordersPage.templateAssigned")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.template_title ?? t("ordersPage.noTemplate")}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => openOrderPreview(item)}>
                    {t("ordersPage.viewDetail")}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {t("common.delete")}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(previewOrder)} onClose={() => setPreviewOrder(null)} fullWidth maxWidth="lg">
        <DialogTitle>
          {previewOrder
            ? t("ordersPage.previewWithName", { name: previewOrder.name })
            : t("ordersPage.previewTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("ordersPage.previewInstructions")}
          </Typography>
          <Box
            ref={printableContentRef}
            key={previewOrder?.id ?? "order-preview"}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: previewContent }}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              minHeight: 420,
              p: 3,
              outline: "none",
              overflowX: "auto",
              "&:focus": {
                borderColor: "primary.main",
                boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
              },
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                my: 1.5,
              },
              "& th, & td": {
                border: "1px solid",
                borderColor: "divider",
                p: 1,
                textAlign: "left",
              },
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
              "& figure.image.image_resized": {
                display: "block",
                boxSizing: "border-box",
              },
              "& figure.image.image_resized img": {
                width: "100%",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOrder(null)}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={printOrderPreview} startIcon={<PrintIcon />}>
            {t("ordersPage.printModified")}
          </Button>
        </DialogActions>
      </Dialog>

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
