import React, { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Affectations.css";

const initialForm = {
  UtilisateurId: "",
  TacheId: "",
  Etat: "EnCours",
  DureeExacte: "",
  DateRealisation: "",
};

const Affectations = () => {
  const [formData, setFormData] = useState(initialForm);
  const [affectations, setAffectations] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [taches, setTaches] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  // Chargement des données
  const loadAll = async () => {
    try {
      const [resCollab, resTache, resAff] = await Promise.all([
        api.get("/Collaborateurs"),
        api.get("/Taches"),
        api.get("/AffectationTaches"),
      ]);
      setCollaborateurs(resCollab.data || []);
      setTaches(resTache.data || []);
      setAffectations(resAff.data || []);
    } catch {
      toast.error("❌ Erreur de chargement des données");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "UtilisateurId" || name === "TacheId"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    const { UtilisateurId, TacheId, Etat, DureeExacte, DateRealisation } = formData;
    if (!UtilisateurId || !TacheId || !Etat) {
      toast.error("❗ Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const payload = {
      UtilisateurId,
      TacheId,
      Etat,
      DureeExacte: DureeExacte !== "" ? parseFloat(DureeExacte) : null,
      DateRealisation:
        Etat === "Termine"
          ? (DateRealisation ? new Date(DateRealisation).toISOString() : new Date().toISOString())
          : (DateRealisation ? new Date(DateRealisation).toISOString() : null),
    };
    try {
      if (editId) {
        await api.put(`/AffectationTaches/${editId}`, { Id: editId, ...payload });
        toast.success("✅ Affectation modifiée !");
      } else {
        await api.post("/AffectationTaches", payload);
        toast.success("✅ Affectation ajoutée !");
      }
      resetForm();
      loadAll();
    } catch (e) {
      toast.error("❌ Erreur : " + (e.response?.data || e.message));
    }
  };

  const confirmDelete = (id) => setDeleteDialog({ open: true, id });

  const handleDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    toast.promise(api.delete(`/AffectationTaches/${id}`), {
      loading: "Suppression en cours...",
      success: "✅ Affectation supprimée !",
      error: "❌ Échec de la suppression",
    }).then(() => loadAll());
  };

  const columns = useMemo(() => [
    { accessorKey: "NomCollaborateur", header: "Collaborateur" },
    { accessorKey: "TitreTache", header: "Tâche" },
    { accessorKey: "NomProjet", header: "Projet" },
    { accessorKey: "Duree", header: "Est. (h)" },
    {
      accessorKey: "Deadline",
      header: "Deadline",
      Cell: ({ cell }) => cell.getValue()?.substring(0, 10) || "—",
    },
    { accessorKey: "DureeExacte", header: "Réel (h)" },
    {
      accessorKey: "DateRealisation",
      header: "Réalisé le",
      Cell: ({ cell }) => cell.getValue()?.substring(0, 10) || "—",
    },
    {
      accessorKey: "Etat",
      header: "État",
      Cell: ({ cell }) => {
        const v = cell.getValue();
        const status = v === "Termine" ? "Terminé" : v === "EnCours" ? "En cours" : "En retard";
        return <span className={`etat-badge ${v === "Termine" ? "termine" : v === "EnCours" ? "encours" : "enretard"}`}>{status}</span>;
      },
    },
    {
      accessorKey: "Id",
      header: "Actions",
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Tooltip title="Modifier">
            <IconButton color="primary" size="small" onClick={() => {
              setEditId(row.original.Id);
              setFormData({
                UtilisateurId: row.original.UtilisateurId || "",
                TacheId: row.original.TacheId || "",
                Etat: row.original.Etat === "Termine" ? "Termine" : row.original.Etat === "EnRetard" ? "EnRetard" : "EnCours",
                DureeExacte: row.original.DureeExacte?.toString() || "",
                DateRealisation: row.original.DateRealisation?.substring(0, 10) || "",
              });
              setShowForm(true);
            }}>
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton color="error" size="small" onClick={() => confirmDelete(row.original.Id)}>
              <DeleteForeverIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: affectations,
    enableGlobalFilter: true,
    enablePagination: true,
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
    muiTableHeadCellProps: { sx: { background: "linear-gradient(135deg, #1976d2, #00c6ff)", color: "#fff", fontWeight: 600 } },
    muiTableBodyCellProps: { sx: { padding: "12px", textAlign: "center" } },
    muiTableBodyRowProps: { sx: { "&:hover": { backgroundColor: "#e3f2fd" } } },
  });

  return (
    <Box className="collab-page">
      <Typography variant="h4" className="page-title">
        <AssignmentIcon /> Gestion des Affectations
      </Typography>
      <Paper className="table-paper">
        <MaterialReactTable table={table} />
      </Paper>

      {/* Formulaire */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? "Modifier une affectation" : "Nouvelle affectation"}</DialogTitle>
        <DialogContent
  dividers
  sx={{
    display: "grid",
    gap: 1.5,
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    padding: "24px",
  }}
>

          {/* Collaborateur | Tâche | État | Durée | Date */}
          <FormControl size="small"><InputLabel>Collaborateur</InputLabel><Select name="UtilisateurId" value={formData.UtilisateurId} onChange={handleChange} label="Collaborateur"><MenuItem value=""><em>— Choisir —</em></MenuItem>{collaborateurs.map(c => <MenuItem key={c.Id} value={c.Id}>{c.Prenom} {c.Nom}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>Tâche</InputLabel><Select name="TacheId" value={formData.TacheId} onChange={handleChange} label="Tâche"><MenuItem value=""><em>— Choisir —</em></MenuItem>{taches.map(t => <MenuItem key={t.Id} value={t.Id}>{t.Titre}{t.Projet?.NomProjet ? ` (${t.Projet.NomProjet})` : ""}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>État</InputLabel><Select name="Etat" value={formData.Etat} onChange={handleChange} label="État"><MenuItem value="EnCours">En cours</MenuItem><MenuItem value="Termine">Terminé</MenuItem><MenuItem value="EnRetard">En retard</MenuItem></Select></FormControl>
          <TextField type="number" name="DureeExacte" label="Durée réelle (h)" value={formData.DureeExacte} onChange={handleChange} size="small" inputProps={{ min: 0, step: 0.25 }} />
          <TextField type="date" name="DateRealisation" label="Date réalisation" value={formData.DateRealisation} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={resetForm}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? "Modifier" : "Ajouter"}</Button>
        </DialogActions>
      </Dialog>

      {/* Suppression */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Voulez-vous vraiment supprimer cette affectation ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Affectations;
