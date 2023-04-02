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
import { Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  Chart,
  PieSeries,
  Title,
} from "@devexpress/dx-react-chart-material-ui";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: "1px solid #0000001f",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function Data() {
  const db = getDatabase();
  const starCountRef = ref(db, "expiry");
  const [expiryData, setExpiryData] = useState([]);
  useEffect(() => {
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      let items = {};
      let totals = {};
      if (data) {
        console.log(Object.values(data));
        Object.values(data).forEach((item) => {
          console.log("ITEM");
          console.log(item);
          if (!(item.name in items)) {
            items[item.name] = {
              name: item.name,
              sum: item.expiry_time,
              count: 1,
            };
          } else {
            items[item.name] = {
              name: item.name,
              sum: items[item.name].sum + item.expiry_time,
              count: items[item.name].count + 1,
            };
          }
        });
        totals = Object.values(items).map((item) => {
          return {
            name: item.name,
            avg: item.sum / item.count,
            sum: item.sum,
            count: item.count,
          };
        });
        setExpiryData(totals);
      }
    });
  }, []);
  console.log(expiryData);

  const data = [
    { argument: "Monday", value: 10 },
    { argument: "Tuesday", value: 40 },
    { argument: "Wednesday", value: 10 },
    { argument: "Thursday", value: 20 },
    { argument: "Friday", value: 20 },
  ];
  return (
    <>
      <Container maxWidth="md" sx={{ marginTop: "30px" }}>
        <Typography
          variant="h1"
          component="h2"
          sx={{ textAlign: "center", fontWeight: "400", color: "black" }}
        >
          Sustainabite
        </Typography>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 440, marginTop: "15px" }}
        >
          <Table
            sx={{ minWidth: 700 }}
            stickyHeader
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>Item Name</StyledTableCell>
                <StyledTableCell>Data Count</StyledTableCell>
                <StyledTableCell>Avg Storage Life</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expiryData?.map((item) => (
                <StyledTableRow key={item.name}>
                  <StyledTableCell component="th" scope="row">
                    {item.name}
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    {item.count}
                  </StyledTableCell>
                  <StyledTableCell align="left">{item.avg}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Chart data={data}>
          <PieSeries valueField="value" argumentField="argument" />
          <Title text="Studies per day" />
        </Chart> */}
      </Container>
    </>
  );
}

export default Data;
