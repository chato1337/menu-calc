import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
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

import { createAgeGroup, deleteAgeGroup, listAgeGroups, updateAgeGroup } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { CrudFormActions } from "../components/CrudFormActions";
import { PaginationControls } from "../components/PaginationControls";
import { AgeGroup, AgeGroupPayload } from "../types/domain";

const LIMIT = 10;

export function AgeGroupsPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<AgeGroup | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const queryKey = useMemo(() => ["age-groups", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listAgeGroups({ limit: LIMIT, offset }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["age-groups"] });
    await queryClient.invalidateQueries({ queryKey: ["product-quantities"] });
  };
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const createMutation = useMutation({
    mutationFn: (payload: AgeGroupPayload) => createAgeGroup(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AgeGroupPayload }) => updateAgeGroup(id, payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      setEditing(null);
      await refresh();
      showSnackbar(t("notifications.updated"), "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAgeGroup(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!name.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    const payload: AgeGroupPayload = { name: name.trim(), quantity: parsedQuantity };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        showSnackbar(t("notifications.created"), "success");
      },
    });
  }

  function startEdit(item: AgeGroup) {
    setEditing(item);
    setName(item.name);
    setQuantity(String(item.quantity));
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setQuantity("");
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("ageGroupsPage.title")}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t("ageGroupsPage.description")}
      </Typography>
      <Stack component="form" onSubmit={onSubmit} direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <TextField
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label={t("ageGroupsPage.profileName")}
          placeholder={t("ageGroupsPage.profileNamePlaceholder")}
          required
        />
        <TextField
          size="small"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          label={t("ageGroupsPage.peopleCount")}
          type="number"
          inputProps={{ min: 1, step: 1 }}
          required
        />
        <CrudFormActions editing={Boolean(editing)} onCancel={resetForm} />
      </Stack>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("ageGroupsPage.people")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.results ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => startEdit(item)}>
                      {t("common.edit")}
                    </Button>
                    <Button size="small" color="error" onClick={() => deleteMutation.mutate(item.id)}>
                      {t("common.delete")}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
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
