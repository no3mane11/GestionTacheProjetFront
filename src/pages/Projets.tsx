import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  TextField,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import toast from "react-hot-toast";
import api from "../services/api";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/delete.svg";
import "./Projets.css";

// ✅ Typage pour deleteDialog
type DeleteDialogState = {
  open: boolean;
  id: number | null;
};

const Projets = () => {
  const [projets, setProjets] = useState([]);
  const [nomProjet, setNomProjet] = useState("");
  const [dateDebutProjet, setDateDebutProjet] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    id: null,
  });

  /** --- Charger les projets --- */
  const load = async () => {
    try {
      const res = await api.get("/Projets/dto");
      setProjets(res.data);
    } catch {
      toast.error("❌ Erreur lors du chargement des projets");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** --- Réinitialiser le formulaire --- */
  const resetForm = () => {
    setNomProjet("");
    setDateDebutProjet("");
    setEditId(null);
    setShowForm(false);
  };

  /** --- Soumission du formulaire --- */
  const handleSubmit = async () => {
    if (!nomProjet.trim() || !dateDebutProjet) {
      toast.error("❗ Veuillez remplir tous les champs.");
      return;
    }

    const payload = {
      NomProjet: nomProjet,
      DateDebutProjet: dateDebutProjet,
    };

    if (editId) payload["Id"] = editId;

    try {
      if (editId) {
        await api.put(`/Projets/${editId}`, payload);
        toast.success("✅ Projet modifié avec succès !");
      } else {
        await api.post("/Projets", payload);
        toast.success("✅ Projet ajouté avec succès !");
      }

      resetForm();
      load();
    } catch (e) {
      toast.error("❌ Erreur : " + (e.response?.data || e.message));
    }
  };

  /** --- Suppression --- */
  const confirmDelete = (id: number) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;

    setDeleteDialog({ open: false, id: null });

    toast
      .promise(api.delete(`/Projets/${id}`), {
        loading: "Suppression en cours...",
        success: "✅ Projet supprimé avec succès !",
        error: "❌ Échec de la suppression",
      })
      .then(() => load());
  };

  /** --- Colonnes --- */
  const columns = useMemo(
    () => [
      { accessorKey: "NomProjet", header: "Nom du projet" },
      {
        accessorKey: "Id",
        header: "Actions",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <Tooltip title="Modifier le projet">
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setNomProjet(row.original.NomProjet);
                  setDateDebutProjet(
                    row.original.DateDebutProjet
                      ? row.original.DateDebutProjet.substring(0, 10)
                      : ""
                  );
                  setEditId(row.original.Id);
                  setShowForm(true);
                }}
              >
                <img src={editIcon} alt="Modifier" className="icon-button edit-icon" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer le projet">
              <IconButton
                color="error"
                size="small"
                onClick={() => confirmDelete(row.original.Id)}
              >
                <img src={deleteIcon} alt="Supprimer" className="icon-button delete-icon" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  /** --- Table --- */
  const table = useMaterialReactTable({
    columns,
    data: projets,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    initialState: { showGlobalFilter: false },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 2 }}>
        <MRT_GlobalFilterTextField
          table={table}
          placeholder="🔍 Rechercher un projet..."
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          sx={{ ml: 2 }}
          onClick={() => {
            setEditId(null);
            setNomProjet("");
            setDateDebutProjet("");
            setShowForm(true);
          }}
        >
          Nouveau Projet
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: 3,
        overflow: "hidden",
        background: "var(--bg-card)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        transition: "0.25s",
        "&:hover": {
          background: "linear-gradient(90deg,#f0f4ff,#f9f9f9)",
          transform: "translateX(2px)",
          boxShadow: "0 2px 12px rgba(25,118,210,0.08)",
        },
      },
    },
    muiTableHeadProps: { sx: { backgroundColor: "var(--primary)" } },
    muiTableHeadCellProps: { sx: { color: "white", fontWeight: 700 } },
  });

  /** --- Rendu --- */
  return (
    <Box sx={{ p: 3 }} className="projets-page">
      <Typography
        variant="h4"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 600,
          color: "var(--text-dark)",
          mb: 3,
        }}
      >
        <FolderIcon sx={{ fontSize: 38, color: "var(--primary)" }} />
        Gestion des Projets
      </Typography>

      <Paper className="table-card" sx={{ p: 2 }}>
        <MaterialReactTable table={table} />
      </Paper>

      {/* Formulaire d'ajout/modification */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editId ? "Modifier le projet" : "Ajouter un nouveau projet"}
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nom du projet"
            value={nomProjet}
            onChange={(e) => setNomProjet(e.target.value)}
            fullWidth
            size="small"
            autoFocus
          />
          <TextField
            label="Date de début"
            type="date"
            value={dateDebutProjet}
            onChange={(e) => setDateDebutProjet(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={resetForm} variant="outlined" color="secondary">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Modifier" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent dividers>
          Voulez-vous vraiment supprimer ce projet ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projets;
