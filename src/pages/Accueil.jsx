import React from "react";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import "./Accueil.css";

export default function Accueil() {
  return (
    <Box className="accueil-page">
      <Paper elevation={6} className="accueil-card">
        <Typography variant="h3" className="accueil-title">
          Bienvenue
        </Typography>

        <Typography variant="body1" className="accueil-text">
          Dans l'application de <strong>gestion des tâches</strong>, vous pouvez :
        </Typography>

        <List className="accueil-list">
          <ListItem>
            <ListItemIcon>
              <AddCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Créer des projets et des collaborateurs" />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AssignmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Ajouter, modifier et suivre les tâches" />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <GroupWorkIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Affecter les tâches aux collaborateurs" />
          </ListItem>
        </List>

        <Box className="accueil-footer">
          <ArrowDownwardIcon fontSize="small" color="action" />
          <Typography variant="body2">
            Utilisez la barre de navigation pour commencer
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
