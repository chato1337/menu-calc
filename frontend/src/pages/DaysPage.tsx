import { FormEvent, UIEvent, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
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

import { createDay, deleteDay, listDays, listRecipes, updateDay } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { Day, DayPayload, Recipe } from "../types/domain";

const LIMIT = 10;
const RECIPE_SEARCH_LIMIT = 20;

export function DaysPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Day | null>(null);
  const [name, setName] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  const queryKey = useMemo(() => ["days", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listDays({ limit: LIMIT, offset }),
  });

  const {
    data: recipePages,
    isLoading: isLoadingRecipes,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["recipes", "day-selector", debouncedSearchInput],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listRecipes({
        limit: RECIPE_SEARCH_LIMIT,
        offset: pageParam,
        search: debouncedSearchInput,
      }),
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((sum, page) => sum + page.results.length, 0);
      return loadedCount < lastPage.count ? loadedCount : undefined;
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const recipeOptions = useMemo(() => {
    const map = new Map<number, Recipe>();
    for (const page of recipePages?.pages ?? []) {
      for (const recipe of page.results) {
        map.set(recipe.id, recipe);
      }
    }
    return Array.from(map.values());
  }, [recipePages]);

  const selectedRecipes = useMemo(() => {
    const map = new Map(recipeOptions.map((item) => [item.id, item]));
    return selectedRecipeIds.map(
      (id) => map.get(id) ?? { id, name: t("daysPage.recipeFallback", { id }), products: [] }
    );
  }, [recipeOptions, selectedRecipeIds, t]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["days"] });
  };
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const createMutation = useMutation({
    mutationFn: (payload: DayPayload) => createDay(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DayPayload }) => updateDay(id, payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      resetForm();
      await refresh();
      showSnackbar(t("notifications.updated"), "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDay(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: DayPayload = {
      name: name.trim(),
      recipes: selectedRecipeIds,
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

  function startEdit(item: Day) {
    setEditing(item);
    setName(item.name);
    setSelectedRecipeIds(item.recipes);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setSelectedRecipeIds([]);
    setSearchInput("");
    setDebouncedSearchInput("");
  }

  function onRecipeListScroll(event: UIEvent<HTMLUListElement>) {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
    if (reachedBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("daysPage.title")}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t("daysPage.description")}
      </Typography>
      <Stack component="form" onSubmit={onSubmit} direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <TextField size="small" value={name} onChange={(e) => setName(e.target.value)} label={t("common.name")} required />
        <Autocomplete
          multiple
          sx={{ minWidth: 360 }}
          options={recipeOptions}
          value={selectedRecipes}
          loading={isLoadingRecipes || isFetchingNextPage}
          filterOptions={(options) => options}
          getOptionLabel={(option) => `${option.name} (#${option.id})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setSelectedRecipeIds(value.map((item) => item.id))}
          inputValue={searchInput}
          onInputChange={(_, value) => setSearchInput(value)}
          ListboxProps={{ onScroll: onRecipeListScroll }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={`${option.name || t("common.recipe")} (#${option.id})`}
                size="small"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={t("daysPage.recipesLabel")}
              placeholder={t("daysPage.recipeSearchPlaceholder")}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoadingRecipes || isFetchingNextPage ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Button variant="contained" type="submit">
          {editing ? t("common.update") : t("common.create")}
        </Button>
        {editing ? (
          <Button type="button" variant="outlined" onClick={resetForm}>
            {t("common.cancel")}
          </Button>
        ) : null}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t("daysPage.selectedRecipes", { count: selectedRecipeIds.length })}
      </Typography>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.recipes")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {(item.recipe_details ?? []).length > 0
                  ? item.recipe_details.map((recipe) => recipe.name).join(", ")
                  : item.recipes.join(", ")}
              </TableCell>
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
