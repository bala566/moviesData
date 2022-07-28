const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base Error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// return a list of all the players from the team
// API 1

const convertDbObject = (objectItem) => {
  return {
    movie_id: objectItem.movie_id,
    director_id: objectItem.director_id,
    movie_name: objectItem.movie_name,
    lead_actor: objectItem.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const getMoviesQueryResponse = await database.all(getMoviesQuery);
  response.send(
    getMoviesQueryResponse.map((eachMovie) => convertDbObject(eachMovie))
  );
});

//post a player into data base
// API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMoviesQuery = ` INSERT INTO movie(director_id,
    movie_name,lead_actor) 
    VALUES('${directorId}',${movieName},'${leadActor}');`;
  const createMoviesQueryResponse = await database.run(createMoviesQuery);
  response.send(`Movie Successfully Added`);
});

// get the player details based on the player id
// API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesDetailsQuery = `SELECT * FROM movie WHERE 
  movie_id = ${movieId};`;
  const getMoviesDetailsQueryResponse = await database.get(
    getMoviesDetailsQuery
  );
  response.send(convertDbObject(getMoviesDetailsQueryResponse));
});

//update the details of the player using player ID
// API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMoviesDetailsQuery = `UPDATE movie SET 
  director_id = '${directorId}' , movie_name = ${movieName} , lead_actor = '${eadActors}' 
  WHERE movie_id = ${movieId};`;
  await database.run(updateMoviesDetailsQuery);
  response.send("Movie Details Updated");
});

// delete the player details
//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMoviesQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await database.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

const convertDbObjectDirector = (objectItem) => {
  return {
    director_id: objectItem.director_id,
    director_name: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const getDirectorsQueryResponse = await database.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachDirector) =>
      convertDbObjectDirector(eachDirector)
    )
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesDetailsQuery = `SELECT movie_name FROM movie JOIN director WHERE  
  director_id = ${directorId};`;
  const getDirectorMoviesDetailsQueryResponse = await database.get(
    getDirectorMoviesDetailsQuery
  );
  response.send(convertDbObjectDirector(getDirectorMoviesDetailsQueryResponse));
});
module.exports = app;
