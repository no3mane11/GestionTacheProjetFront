import React, { useEffect, useState, useMemo } from "react";
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
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Taches.css"; // On adaptera le style CSS juste après

const initialForm = {
  Titre: "",
  Description: "",
  ProjetId: "",
  Duree: "",
  Deadline: "",
};

const Taches = () => {
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const loadAll = async () => {
    try {
      const [resTaches, resProjets] = await Promise.all([
        api.get("/Taches"),
        api.get("/Projets/dto"),
      ]);
      setTaches(resTaches.data || []);
      setProjets(resProjets.data || []);
    } catch {
      toast.error("❌ Erreur de chargement des données.");
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.Titre || !formData.ProjetId) {
      toast.error("❗ Veuillez remplir les champs obligatoires.");
      return;
    }
    const payload = {
      Titre: formData.Titre,
      Description: formData.Description,
      ProjetId: parseInt(formData.ProjetId),
      Duree: formData.Duree ? parseInt(formData.Duree) : null,
      Deadline: formData.Deadline || null,
    };
    try {
      if (editId) {
        await api.put(`/Taches/${editId}`, { Id: editId, ...payload });
        toast.success("✅ Tâche modifiée !");
      } else {
        await api.post("/Taches", payload);
        toast.success("✅ Tâche ajoutée !");
      }
      resetForm();
      loadAll();
    } catch {
      toast.error("❌ Erreur lors de l'enregistrement.");
    }
  };

  const handleEdit = (t) => {
    setFormData({
      Titre: t.Titre || "",
      Description: t.Description || "",
      ProjetId: t.ProjetId?.toString() || "",
      Duree: t.Duree?.toString() || "",
      Deadline: t.Deadline?.substring(0, 10) || "",
    });
    setEditId(t.Id);
    setShowForm(true);
  };

  const confirmDelete = (id) => setDeleteDialog({ open: true, id });
  const handleDelete = async () => {
    await toast.promise(api.delete(`/Taches/${deleteDialog.id}`), {
      loading: "Suppression en cours...",
      success: "✅ Tâche supprimée !",
      error: "❌ Échec de la suppression",
    });
    setDeleteDialog({ open: false, id: null });
    loadAll();
  };

  const columns = useMemo(() => [
    { accessorKey: "Titre", header: "Titre" },
    { accessorKey: "Description", header: "Description" },
    { accessorKey: "Duree", header: "Durée (h)" },
    {
      accessorKey: "Deadline",
      header: "Deadline",
      Cell: ({ cell }) => cell.getValue() ? cell.getValue().substring(0, 10) : "—",
    },
    {
      accessorKey: "Projet.NomProjet",
      header: "Projet",
      Cell: ({ row }) => row.original.Projet?.NomProjet || "Aucun projet",
    },
    {
      accessorKey: "Id",
      header: "Actions",
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Tooltip title="Modifier la tâche">
            <IconButton color="primary" size="small" onClick={() => handleEdit(row.original)}>
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer la tâche">
            <IconButton color="error" size="small" onClick={() => confirmDelete(row.original.Id)}>
              <DeleteForeverIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [projets, taches]);

  const table = useMaterialReactTable({
    columns,
    data: taches,
    enableGlobalFilter: true,
    enablePagination: true,
    initialState: { showGlobalFilter: true, pagination: { pageSize: 5 } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box className="toolbar-enhanced">
        <MRT_GlobalFilterTextField table={table} placeholder="Recherche..." size="small" />
        <Button variant="contained" startIcon={<PlaylistAddIcon />} onClick={() => { resetForm(); setShowForm(true); }}>
          Ajouter
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      sx: {
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        overflow: "hidden",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        background: "linear-gradient(135deg, #1976d2, #00c6ff)",
        color: "#fff",
        fontWeight: 600,
        textAlign: "center",
      },
    },
    muiTableBodyCellProps: { sx: { padding: "12px", textAlign: "center" } },
    muiTableBodyRowProps: { sx: { "&:hover": { backgroundColor: "#e3f2fd" } } },
  });

  return (
    <Box className="collab-page">
      <Typography variant="h4" className="page-title">
        <AssignmentTurnedInIcon /> Gestion des Tâches
      </Typography>
      <Paper className="table-paper">
        <MaterialReactTable table={table} />
      </Paper>

      {/* Formulaire intact */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Modifier une tâche" : "Ajouter une tâche"}</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
          <TextField name="Titre" label="Titre" value={formData.Titre} onChange={handleChange} size="small" fullWidth />
          <TextField name="Description" label="Description" value={formData.Description} onChange={handleChange} multiline minRows={2} size="small" fullWidth />
          <TextField name="Duree" label="Durée estimée (h)" type="number" value={formData.Duree} onChange={handleChange} size="small" fullWidth />
          <TextField name="Deadline" label="Deadline" type="date" value={formData.Deadline} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Projet</InputLabel>
            <Select name="ProjetId" value={formData.ProjetId} onChange={handleChange} label="Projet">
              {projets.map((p) => (
                <MenuItem key={p.Id} value={p.Id}>{p.NomProjet}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={resetForm}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? "Modifier" : "Ajouter"}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation suppression intact */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent dividers>
          Voulez-vous vraiment supprimer cette tâche ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} color="secondary">Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Taches;
