import { Autocomplete, Chip, CircularProgress, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AgeGroup } from "../types/domain";

interface AgeGroupSelectorProps {
  options: AgeGroup[];
  selectedIds: number[];
  loading?: boolean;
  onChange: (ids: number[]) => void;
}

export function AgeGroupSelector({ options, selectedIds, loading, onChange }: AgeGroupSelectorProps) {
  const { t } = useTranslation();
  const optionsById = new Map(options.map((item) => [item.id, item]));
  const selectedOptions = selectedIds.map((id) => ({
    id,
    name: optionsById.get(id)?.name ?? t("productQuantitiesPage.profileFallback", { id }),
    quantity: optionsById.get(id)?.quantity ?? 0,
  }));

  return (
    <Autocomplete
      multiple
      sx={{ minWidth: 360 }}
      options={options}
      value={selectedOptions}
      loading={loading}
      filterOptions={(available) => available}
      getOptionLabel={(option) => `${option.name} (${option.quantity})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, value) => onChange(value.map((item) => item.id))}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={`${option.name} (${option.quantity})`}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={t("labels.profiles")}
          placeholder={t("labels.selectProfiles")}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
