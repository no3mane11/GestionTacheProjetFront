import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField
} from "material-react-table";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import toast from "react-hot-toast";
import api from "../services/api";
import "./Collaborateurs.css";

const initialForm = {
  Nom: "",
  Prenom: "",
  Email: "",
  Telephone: "",
  MotDePasse: "",
  PhotoProfil: undefined
};

const Collaborateurs = () => {
  const [collabs, setCollabs] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const load = async () => {
    try {
      const res = await api.get("/Collaborateurs");
      setCollabs(res.data || []);
    } catch {
      toast.error("❌ Erreur lors du chargement des collaborateurs");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "PhotoProfil" && files?.[0]) {
      setFormData((prev) => ({ ...prev, PhotoProfil: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      ["Nom", "Prenom", "Email", "Telephone", "MotDePasse"].forEach((field) => {
        data.append(field, formData[field]);
      });
      data.append("NomUtilisateur", `${formData.Nom}.${formData.Prenom}`);
      if (formData.PhotoProfil) data.append("PhotoProfil", formData.PhotoProfil);

      editId
        ? await api.post(`/Collaborateurs/update-photo/${editId}`, data)
        : await api.post("/Utilisateurs/register", data);

      toast.success(editId ? "✅ Collaborateur modifié" : "✅ Collaborateur ajouté");
      resetForm();
      load();
    } catch (e) {
      toast.error("❌ Erreur : " + (e.response?.data || e.message));
    }
  };

  const confirmDelete = (id) => setDeleteDialog({ open: true, id });
  const handleDelete = async () => {
    await toast.promise(api.delete(`/Collaborateurs/${deleteDialog.id}`), {
      loading: "Suppression en cours...",
      success: "✅ Collaborateur supprimé !",
      error: "❌ Échec de la suppression"
    });
    setDeleteDialog({ open: false, id: null });
    load();
  };

  const getProfileImage = (photo, email) =>
    photo ? photo : email ? `https://i.pravatar.cc/60?u=${email}` : "/default-avatar.png";

  const columns = useMemo(
    () => [
      {
        id: "NomComplet",
        header: "Nom complet",
        accessorFn: (row) => `${row.Nom} ${row.Prenom}`,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src={getProfileImage(row.original.PhotoProfil, row.original.Email)}
              alt="avatar"
              width={40}
              height={40}
              onError={(e) => (e.currentTarget.src = `https://i.pravatar.cc/60?u=${row.original.Email}`)}
            />
            <span>{`${row.original.Nom} ${row.original.Prenom}`}</span>
          </Box>
        )
      },
      { accessorKey: "NomUtilisateur", header: "Nom Utilisateur" },
      { accessorKey: "Email", header: "Email" },
      { accessorKey: "Telephone", header: "Téléphone" },
      {
        accessorKey: "Id",
        header: "Actions",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="Modifier">
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setEditId(row.original.Id);
                  setFormData({
                    Nom: row.original.Nom,
                    Prenom: row.original.Prenom,
                    Email: row.original.Email,
                    Telephone: row.original.Telephone,
                    MotDePasse: "",
                    PhotoProfil: undefined
                  });
                  setShowForm(true);
                }}
              >
                <DriveFileRenameOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton color="error" size="small" onClick={() => confirmDelete(row.original.Id)}>
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: collabs,
    enableGlobalFilter: true,
    initialState: { showGlobalFilter: true },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box className="toolbar-enhanced">
        <MRT_GlobalFilterTextField table={table} placeholder="Recherche..." size="small" />
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => { resetForm(); setShowForm(true); }}>
          Ajouter
        </Button>
      </Box>
    ),
    muiTablePaperProps: {
      sx: {
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        overflow: "hidden"
      }
    },
    muiTableHeadCellProps: {
      sx: {
        background: "linear-gradient(135deg, #1976d2, #00c6ff)",
        color: "#fff",
        fontWeight: 600
      }
    },
    muiTableBodyCellProps: { sx: { padding: "12px", textAlign: "center" } },
    muiTableBodyRowProps: { sx: { "&:hover": { backgroundColor: "#e3f2fd" } } }
  });

  return (
    <Box className="collab-page">
      <Typography variant="h4" className="page-title">
        <GroupsIcon /> Gestion des Collaborateurs
      </Typography>
      <Paper className="table-paper">
        <MaterialReactTable table={table} />
      </Paper>

      {/* Formulaire */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? "Modifier le collaborateur" : "Ajouter un collaborateur"}</DialogTitle>
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

          <TextField label="Nom" name="Nom" value={formData.Nom} onChange={handleChange} size="small" fullWidth />
          <TextField label="Prenom" name="Prenom" value={formData.Prenom} onChange={handleChange} size="small" fullWidth />
          <TextField label="Email" name="Email" value={formData.Email} onChange={handleChange} size="small" fullWidth />
          <TextField label="Téléphone" name="Telephone" value={formData.Telephone} onChange={handleChange} size="small" fullWidth />
          <TextField label="Mot de passe" name="MotDePasse" type="password" value={formData.MotDePasse} onChange={handleChange} size="small" fullWidth />
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Photo de profil</Typography>
            <input type="file" name="PhotoProfil" accept="image/*" onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={resetForm}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? "Modifier" : "Ajouter"}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation suppression */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>Voulez-vous vraiment supprimer ce collaborateur ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Collaborateurs;
