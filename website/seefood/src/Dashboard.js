import "./Dashboard.css";
import { getDatabase, ref, onValue } from "firebase/database";
import { useEffect, useState, Fragment } from "react";
import Button from "@mui/material/Button";
import { Container, Grid } from "@mui/material";
import Item from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/system";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Rating from "@mui/material/Rating";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

function getColor(value) {
  //value from 0 to 1
  var hue = ((1 - value) * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}

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

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));

function Dashboard() {
  const db = getDatabase();
  const starCountRef = ref(db, "items");

  let [itemData, setItemData] = useState([]);
  let [groceryRecs, setGroceryRecs] = useState([]);
  let [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [intolerance, setIntolerance] = useState("");
  const [diet, setDiet] = useState("");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const handleOpen = async (id, name) => {
    let new_data;
    console.log(
      `https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=sponacularAPI`
    );
    let r = await fetch(
      `https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=sponacularAPI`
    );
    if (!r.ok) {
      return;
    }
    let data = await r.json();
    if (data.length > 0) {
      new_data = { ...data[0], name: name, id: id };
    }
    r = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=sponacularAPI`
    );
    if (!r.ok) {
      return;
    }
    data = await r.json();
    if (data) {
      new_data = { ...new_data, ingredients: data.extendedIngredients };
      await new_data.ingredients.forEach(async (ingredient) => {
        r = await fetch(
          `https://api.spoonacular.com/food/ingredients/substitutes?apiKey=sponacularAPI&ingredientName=${ingredient.name}`
        );
        if (!r.ok) {
          return;
        }
        data = await r.json();
        console.log(data);
        if (data) {
          ingredient.substitutes = data.substitutes;
        }
      });
    }
    console.log(new_data);
    setSelectedItem(new_data);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  useEffect(() => {
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let v = Object.values(data);
        let k = Object.keys(data);
        v = v.map((item, i) => {
          return { ...item, id: k[i] };
        });
        setItemData(v);
      }
    });
    let localItems = localStorage.getItem("groceryRecs");
    if (localItems != null) {
      setGroceryRecs(localItems.split(","));
    }
  }, []);

  // Code for recipe preperation:

  const FridgeList = [
    "chicken",
    "tomato",
    "pasta",
    "onion",
    "beef",
    "potato",
    "carrot",
  ];

  const [allRecipeData, setAllRecipeData] = useState([]);

  const searchForFood = () => {
    fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=sponacularAPI&ingredients=${FridgeList.join(
        ","
      )}&number=6&ignorePantry=false&ranking=2`
    )
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((data) => {
        if (data) {
          setAllRecipeData(data);
        }
        console.log(data);
      })
      .catch(() => {
        console.log("error");
      });
  };

  const findGroceryRecs = async () => {
    let recipes = [];
    let r = await fetch(
      `https://api.spoonacular.com/recipes/findByNutrients?apiKey=sponacularAPI&minCarbs=0&maxCarbs=100&minFat=0&maxFat=100&number=3`
    );
    if (!r.ok) {
      return;
    }
    let data = await r.json();
    if (data) {
      console.log(data);
      recipes = data;
      for (let i = 0; i < recipes.length; i++) {
        r = await fetch(
          `https://api.spoonacular.com/recipes/${recipes[i].id}/information?apiKey=sponacularAPI`
        );
        if (!r.ok) {
          return;
        }
        data = await r.json();
        if (data) {
          recipes[i] = data;
        }
      }
    }
    let groceries = [];
    recipes.forEach((recipe) => {
      recipe.extendedIngredients.forEach((ingredient) => {
        if (!FridgeList.includes(ingredient.name)) {
          groceries.push(ingredient.name);
        }
      });
    });
    console.log(groceries);
    localStorage.setItem("groceryRecs", groceries);
    setGroceryRecs(groceries);
  };

  const nextDay = () => {
    setDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));

    let expiring = [];
    itemData.forEach((item) => {
      if (timeToExpiry(item.expiry) <= 2 && timeToExpiry(item.expiry) >= 0) {
        expiring.push(item.name);
      }
    });
    let expiringItems = expiring.join(", ");
    let expiringMessage =
      "Your food may be expiring! Please check your " +
      expiringItems +
      " for their freshness. If they are still usable, check our recommended recipes to use your food quickly";
    if (expiring.length > 0) {
      fetch("TWILIO", {
        method: "post",
        headers: new Headers({
          Authorization: "Basic " + btoa("TWILIO API KEY:TWILIO PASSWORD"),
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        body: `Body=${expiringMessage}&From=+FROMNUMBER&To=+TONUMBER`,
      }).then((response) => {
        console.log(response);
      });
    }
  };

  const timeToExpiry = (d1) => {
    let date1 = new Date(d1);
    let date2 = date;
    return (date1 - date2) / (60 * 60 * 24 * 1000);
  };

  const deleteAll = () => {
    fetch("hfirebaseurl/items.json", {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch(() => {
        console.log("error");
      });
  };

  const deleteOne = (id) => {
    fetch(`hfirebaseurl/items/${id}.json`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch(() => {
        console.log("error");
      });
  };

  const addExpiry = (food) => {
    fetch(`hfirebaseurl/expiry.json`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: food.name,
        expiry_time: (date - new Date(food.expiry)) / (60 * 60 * 24 * 1000),
      }),
    }).then((response) => console.log(response));
  };

  const addReview = (id, score) => {
    fetch(`hfirebaseurl/review.json`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        score: score,
      }),
    }).then((response) => console.log(response));
  };

  return (
    <>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={modalStyle}>
            {selectedItem && (
              <>
                <Typography
                  id="transition-modal-title"
                  variant="h4"
                  component="h2"
                  sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
                >
                  {selectedItem.name}
                </Typography>
                <Typography
                  id="transition-modal-title"
                  variant="h6"
                  component="h4"
                >
                  Ingredients:
                  {selectedItem.ingredients?.map((ingredient) => {
                    return (
                      <>
                        <li
                          style={{
                            color: FridgeList.map((i) =>
                              i.toLowerCase()
                            ).includes(ingredient.name.toLowerCase())
                              ? "green"
                              : "red",
                          }}
                        >
                          {(ingredient.substitutes && (
                            <HtmlTooltip
                              placement="right"
                              title={
                                <Fragment>
                                  {ingredient.substitutes?.map((sub) => {
                                    return <li>{sub}</li>;
                                  })}
                                </Fragment>
                              }
                            >
                              <span>{ingredient.original}</span>
                            </HtmlTooltip>
                          )) || <span>{ingredient.original}</span>}
                        </li>
                      </>
                    );
                  })}
                </Typography>

                <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                  {selectedItem.steps?.map((step, i) => {
                    return (
                      <>
                        <Accordion
                          disableGutters
                          expanded={expanded === "panel" + i}
                          onChange={handleChange("panel" + i)}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                          >
                            <Typography sx={{ width: "33%", flexShrink: 0 }}>
                              Step {i + 1}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>{step.step}</Typography>
                          </AccordionDetails>
                        </Accordion>
                      </>
                    );
                  })}
                </Typography>
              </>
            )}
            <Container sx={{ textAlign: "center", marginTop: "20px" }}>
              <h4>How did you like this recipe!</h4>
              <Rating
                name="simple-controlled"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                  addReview(selectedItem.id, newValue);
                }}
              />
            </Container>
          </Box>
        </Fade>
      </Modal>
      <Container maxWidth="md" sx={{ marginTop: "30px" }}>
        <Typography
          variant="h1"
          component="h2"
          sx={{ textAlign: "center", fontWeight: "400", color: "black" }}
        >
          Sustainabite
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{ textAlign: "center", fontWeight: "400", color: "black" }}
        >
          Current Day: {date.toDateString()}
          <Button
            onClick={nextDay}
            variant="contained"
            sx={{ marginLeft: "5px" }}
            size="small"
            color="success"
          >
            Next Day
          </Button>
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
                <StyledTableCell>Quantity</StyledTableCell>
                <StyledTableCell>Expiry Date</StyledTableCell>
                <StyledTableCell>Purchase Date</StyledTableCell>
                <StyledTableCell align="center">Edit</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemData?.map((item) => (
                <StyledTableRow
                  key={item.name}
                  sx={{
                    background:
                      timeToExpiry(item.expiry) < 0
                        ? "#ff6961 !important"
                        : timeToExpiry(item.expiry) < 3
                        ? "#f8d66d !important"
                        : "#8cd47e !important",
                    borderBottom: "None !important",
                  }}
                >
                  <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {item.name.length > 15
                      ? item.name.substring(0, 15) + "..."
                      : item.name}
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    1
                  </StyledTableCell>
                  <StyledTableCell align="left">{item.expiry}</StyledTableCell>
                  <StyledTableCell align="left">
                    {item.purchase_date}
                  </StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      paddingTop: "0",
                      paddingBottom: "0",
                    }}
                  >
                    <Button
                      size="small"
                      variant="secondary"
                      color="error"
                      sx={{
                        marginTop: "0",
                        marginBottom: "0",
                      }}
                      onClick={() => {
                        addExpiry(item);
                        deleteOne(item.id);
                      }}
                    >
                      Expired
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      color="error"
                      sx={{
                        marginTop: "0",
                        marginBottom: "0",
                      }}
                      onClick={() => {
                        deleteOne(item.id);
                      }}
                    >
                      Remove
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {itemData?.map((item) => {
          return <h1>{item.type}</h1>;
        })}
        <Container sx={{ textAlign: "center", mb: "30px" }}>
          <FormControl size="small" sx={{ marginX: "5px", minWidth: 140 }}>
            <InputLabel id="intolerance-selector">Intolerances</InputLabel>
            <Select
              labelId="intolerance-selector"
              value={intolerance}
              label="intolerance"
              onChange={(e) => {
                setIntolerance(e.target.value);
              }}
            >
              <MenuItem value={"dairy"}>Dairy</MenuItem>
              <MenuItem value={"gluten"}>Gluten</MenuItem>
              <MenuItem value={"soy"}>Soy</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ marginX: "5px", minWidth: 120 }}>
            <InputLabel id="diet-selector">Diet</InputLabel>
            <Select
              labelId="diet-selector"
              value={diet}
              label="diet"
              onChange={(e) => {
                setDiet(e.target.value);
              }}
            >
              <MenuItem value={"vegetarian"}>Vegetarian</MenuItem>
              <MenuItem value={"lowfomap"}>LFODMAP</MenuItem>
              <MenuItem value={"paleo"}>Paleo</MenuItem>
            </Select>
          </FormControl>
          <Button
            onClick={searchForFood}
            variant="contained"
            sx={{ marginX: "5px" }}
          >
            Generate recipes
          </Button>
        </Container>
        {/* <Button onClick={deleteAll} variant="contained">
          purge
        </Button> */}
        {allRecipeData && (
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="stretch"
            sx={{ marginBottom: "40px", textAlign: "center" }}
          >
            {allRecipeData?.map((recipe) => {
              return (
                <Grid item xs={12} md={4}>
                  <Item>
                    <Card>
                      <CardMedia
                        sx={{ objectFit: "cover", height: "200px" }}
                        image={recipe.image}
                        title={recipe.title}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {recipe.title}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() => handleOpen(recipe.id, recipe.title)}
                        >
                          Learn More
                        </Button>
                      </CardActions>
                    </Card>
                  </Item>
                </Grid>
              );
            })}
          </Grid>
        )}
        <Typography
          variant="h3"
          component="h2"
          sx={{ textAlign: "center", fontWeight: "400", color: "black" }}
        >
          Grocery Recommendations
        </Typography>
        <Container sx={{ textAlign: "center" }}>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            sx={{
              marginTop: "0",
              marginBottom: "0",
            }}
            onClick={() => {
              findGroceryRecs();
            }}
          >
            Generate New
          </Button>
          {/* <TextField placeholder="Add Item" size="small" />
          <Button
            size="small"
            variant="contained"
            color="primary"
            sx={{
              marginTop: "0",
              marginBottom: "0",
            }}
            onClick={() => {
              findGroceryRecs();
            }}
          >
            Add
          </Button> */}
        </Container>

        <TableContainer
          component={Paper}
          sx={{ maxHeight: 440, marginTop: "15px", marginBottom: "100px" }}
        >
          <Table
            sx={{ minWidth: 700 }}
            stickyHeader
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>Item Name</StyledTableCell>
                <StyledTableCell>Remove</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groceryRecs?.map((item) => (
                <StyledTableRow
                  key={item}
                  sx={{
                    borderBottom: "None !important",
                  }}
                >
                  <StyledTableCell component="th" scope="row">
                    {item.substring(0, 1).toUpperCase() + item.substring(1)}
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    <Button
                      size="small"
                      variant="secondary"
                      color="error"
                      sx={{
                        marginTop: "0",
                        marginBottom: "0",
                      }}
                      onClick={() => {
                        setGroceryRecs((g) => {
                          let newG = g.filter((i) => i !== item);
                          localStorage.setItem("groceryRecs", newG);
                          return newG;
                        });
                      }}
                    >
                      remove
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}

export default Dashboard;
