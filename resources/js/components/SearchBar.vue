<template>
  <div class="container position-relative">
    <nav class="navbar-light bg-transparent d-flex justify-content-center w-100">
      <div class="col-12 col-md-6 col-lg-6 mt-3">
        <form @submit.prevent="getGeoPosition">
          <div class="d-flex justify-content-between position-relative input-search my-4">
            <input
              class="form-control mr-sm-2 input"
              type="search"
              placeholder="Dove vuoi andare?"
              aria-label="Search"
              autocomplete="off"
              id="query_address"
              v-model="query"
              @keyup="getAutocomplete"
              @keyup.enter="getGeoPosition"
            />

            <ul class="dropdown_menu list-unstyled p-1" v-if="query.length > 0">
              <li v-for="(address, index) in autocomplete" :key="index">
                <input
                  type="text"
                  class="w-100"
                  readonly
                  :value="address"
                  @click="setQuery(address)"
                />
              </li>
            </ul>

            <button class="btn btn-dark my-sm-0 ms-2 py-2" type="submit" id="search-btn">
              <i class="fa-solid fa-magnifying-glass fa-lg"></i>
            </button>
          </div>
        </form>
      </div>
    </nav>
    <div class="row mb-5 pb-5">
      <div class="col">
        <section id="flat-list">
          <h2 class="my-3 text-center mt-5">
            {{ this.message }}
          </h2>

          <!-- AppLoader -->
          <app-loader v-if="isLoading" />
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import FlatCard from "./flats/FlatCard.vue";

export default {
  name: "SearchBar",
  data() {
    return {
      query: "",
      autocomplete: [],
      radius: 50,
      flats: [],
      allFlats: [],
      lat: "",
      lon: "",
      resultsAPI: "",
      responseAPI: "",
      isLoading: false,
      rooms: 1,
      bathrooms: 1,
      beds: 1,
      sqm: 30,
      services: [],
      message: "",
      selectedServices: [],
    };
  },
  props: {
    title: String,
  },
  methods: {
    fetchFlats() {
      this.isLoading = true;
      axios
        .get("http://localhost:8000/api/flats")
        .then((res) => {
          this.flats = res.data;
          this.allFlats = res.data;
        })
        .catch((err) => {
          this.error = "Errore durante il fetch dei flats";
        })
        .then(() => {
          this.isLoading = false;
        });
    },

    getAutocomplete() {
      if (this.query) {
        axios
          .get(
            `https://api.tomtom.com/search/2/search/${this.query}.json?key=qSUikbBmShqOxwAwrrHX28luZ27pYwPx&limit=5&countrySet=IT&language=it-IT&limit=10`
          )
          .then((response) => {
            const results = response.data.results;
            this.autocomplete = [];
            results.forEach((result) => {
              let address = result.address.freeformAddress;

              this.autocomplete.push(address);
            });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
    setQuery(add) {
      console.log(this.query);
      this.query = add;
      this.autocomplete = [];
    },

    getGeoPosition() {
      console.log("geosearch");
      //this.fetchFlats()
      console.log(this.allFlats);
      let query = this.query;
      let radius = this.radius * 1000;
      if (query) {
        this.loading = true;
        axios
          .get(
            `https://api.tomtom.com/search/2/geocode/${query}.json?key=qSUikbBmShqOxwAwrrHX28luZ27pYwPx&limit=1&radius=${radius}`
          )
          .then((response) => {
            let lat = response.data.results[0].position.lat;
            let lon = response.data.results[0].position.lon;

            let flatList = [];

            let geometryList = [
              {
                type: "CIRCLE",
                position: `${lat} , ${lon}`,
                radius: `${radius}`,
              },
            ];

            console.log("geometrylist", JSON.stringify(geometryList));
            console.log("Tutti flats:", this.allFlats);
            this.allFlats.forEach((flat) => {
              let flatPOI = {
                flat: {
                  name: flat.title,
                },
                address: {
                  freeformAddress: flat.address,
                },
                position: {
                  lat: flat.latitude,
                  lon: flat.longitude,
                },
                info: {
                  id: flat.id,
                  rooms: flat.room_number,
                },
              };

              flatList.push(flatPOI);
            });

            console.log("JSON geometry:", JSON.stringify(geometryList));
            console.log("JSON flatlist", JSON.stringify(flatList));
            axios
              .get(
                `https://api.tomtom.com/search/2/geometryFilter.json?key=OQPgwY4eUitV7IRklnutdiB8DVqRx8kG&geometryList=${JSON.stringify(
                  geometryList
                )}&poiList=${JSON.stringify(flatList)}`
              )
              .then((response) => {
                const filteredFlatsByTomtom = response.data.results;
                this.loading = false;

                const flatIds = [];

                console.log("filtered by tomtom ", filteredFlatsByTomtom);

                filteredFlatsByTomtom.forEach((flat) => {
                  flatIds.push(flat.info.id);
                });

                console.log("flatIds", flatIds);

                const filterdFlats = this.allFlats.filter((flat) => {
                  console.log(flat);

                  return flatIds.includes(flat.id);
                });
                console.log(filterdFlats);
                let data = {
                  filterdFlats: filterdFlats,
                  allFlats: this.allFlats,
                  query: this.query,
                };

                if (this.$router.currentRoute.name === "home") {
                  this.$router.push({
                    name: "search",
                    params: { data },
                  });
                }
              })
              .catch((error) => console.error(error));
          })
          .catch((e) => console.error(e));
      }
    },

    shareSearch() {
      let data = this.flats;
      console.log("data", data);
      this.$router.push({ name: "search", params: { data } });
    },

    filterFlats() {
      let flatList = [];
      console.log("lat", this.lat);
      let geometryList = [
        {
          type: "CIRCLE",
          position: `${this.lat} , ${this.lon}`,
          radius: `${this.radius}`,
        },
      ];

      this.flats.forEach((flat) => {
        let flatPOI = {
          poi: {
            name: flat.title,
          },
          address: {
            freeformAddress: flat.address,
          },
          position: {
            lat: flat.lat,
            lon: flat.lon,
          },
        };

        flatList.push(flatPOI);
      });
      axios
        .get(
          `https://api.tomtom.com/search/2/geometryFilter.json?key=OQPgwY4eUitV7IRklnutdiB8DVqRx8kG&geometryList=${JSON.stringify(
            geometryList
          )}&poiList=${JSON.stringify(flatList)}`
        )
        .then((response) => {
          console.log("response:", response.data);
          this.flats = response.data;
          this.loading = false;
        })
        .catch((error) => console.error(error));
    },
  },

  mounted() {
    if (this.$route.params.query) {
      this.query = this.$route.params.query;
    }
    if (this.$route.params.radius) {
      this.radius = this.$route.params.radius;
    }
    this.fetchFlats();
  },
  components: { FlatCard },
};
</script>

<style scoped lang="scss">
.form-control .searchbar {
  padding: 20px 50px;
}

.input-search {
  width: 100%;
  height: 45px;
}

.dropdown_menu {
  position: absolute;
  width: 100%;
  top: 60px;
  z-index: 100;

  input {
    cursor: pointer;

    &:focus {
      background-color: #3471eb;
    }
  }
}
.input-group-text {
  width: 70px;
}

#query_address {
  height: 50px;
  border-radius: 0;
  background-color: #fff;
  border-radius: 0 10px 0 10px;
}



label span {
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#search-btn {
  border-radius: 50%;
  height: 50px;
  width: 50px;
  background-color: crimson;
  border: 0;


}

.container {
  top: 50%;
}
</style>
