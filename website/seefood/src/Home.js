import { getDatabase, ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Container, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import logo from "./imgs/logoLight.png";

function Home() {
  return (
    <>
      <Container sx={{ textAlign: "center", marginTop: "50px" }}>
        <img src={logo} alt="" style={{ maxWidth: "500px" }} />
      </Container>
      <Container sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{ marginRight: "5px" }}
          href="/dashboard"
        >
          Go To Dashboard
        </Button>
        <Button
          variant="contained"
          sx={{ marginLeft: "5px" }}
          href="https://github.com/Tim-gubski/Sustainabite"
        >
          See our code!
        </Button>
      </Container>
    </>
  );
}

export default Home;
