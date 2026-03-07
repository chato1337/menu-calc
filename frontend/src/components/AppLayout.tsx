import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ScaleIcon from "@mui/icons-material/Scale";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { env } from "../config/env";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = 280;
  const navItems = [
    { to: "/products", label: t("layout.nav.products"), icon: <Inventory2Icon /> },
    { to: "/age-groups", label: t("layout.nav.ageGroups"), icon: <GroupsIcon /> },
    { to: "/product-quantities", label: t("layout.nav.productQuantities"), icon: <ScaleIcon /> },
    { to: "/recipes", label: t("layout.nav.recipes"), icon: <MenuBookIcon /> },
    { to: "/days", label: t("layout.nav.days"), icon: <CalendarMonthIcon /> },
    { to: "/orders", label: t("layout.nav.orders"), icon: <ReceiptLongIcon /> },
    { to: "/templates", label: t("layout.nav.templates"), icon: <NoteAltIcon /> },
  ];
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };
  const closeMobileDrawer = () => {
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{env.appName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("layout.subtitle")}
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={active}
              onClick={closeMobileDrawer}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
        <Button
          fullWidth
          variant={i18n.language === "es" ? "contained" : "outlined"}
          color={i18n.language === "es" ? "secondary" : "inherit"}
          aria-label={t("language.es")}
          onClick={() => {
            void i18n.changeLanguage("es");
          }}
        >
          🇪🇸
        </Button>
        <Button
          fullWidth
          variant={i18n.language === "en" ? "contained" : "outlined"}
          color={i18n.language === "en" ? "secondary" : "inherit"}
          aria-label={t("language.en")}
          onClick={() => {
            void i18n.changeLanguage("en");
          }}
        >
          🇺🇸
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ display: { xs: "flex", md: "none" }, borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" aria-label="open navigation menu" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {env.appName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            p: 2,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            p: 2,
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${sidebarWidth}px)` } }}>
        {!isDesktop ? <Toolbar /> : null}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            {env.footerText}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
