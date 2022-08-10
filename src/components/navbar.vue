<template>
<div id="page">
<div id="nav1">
  <nav class="navbar navbar-expand-lg">
    <div class="container-fluid">
      <button
        id="button"
        class="navebar-toggler btn"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navcontent"
        aria-controls="navcontent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      ></button>
      <div class="collapse navbar-collapse" id="navcontent">
        <ul class="navbar-nav me-auto mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="/">HOME</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/login">LOGIN</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/register">REGISTER</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/location">STORE LOCATOR</a>
          </li>
        </ul>
    <img id="logo" src="https://i.postimg.cc/hvGRnvDP/logo.jpg" alt="logo">
    <div class="wrap">
   <div class="search">
      <input type="text" class="searchTerm" placeholder="Search...">
      <button type="submit" class="searchButton">
        <i class="bi bi-search"></i>
     </button>
   </div>
</div>
      </div>
    </div>
  </nav>
  </div>
  <div id="nav2" class="sticky-top">
    <div v-for="filters in filter" :key="filters" class="btn-group">
  <button id="filter" class="btn" type="button">
    {{ filters.name }}
  </button>
</div>
  </div>
  </div>
</template>

<script>
export default {
  computed: {
    filter() {
      return this.$store.state.filter
    }
  }
}
</script>

<style scoped>
#nav1{
    background-color: gray;
}
.nav-link{
  color: white;
}
#nav2{
    background-color: gray;
}
#logo{
    height: 50px;
}
#button{
  background-color: black;
}
.search {
    width: 100%;
  position: relative;
  display: flex;
}

.searchTerm {
    width: 100%;
  border: 3px solid #00B4CC;
  border-right: none;
  padding: 5px;
  border-radius: 5px 0 0 5px;
  outline: none;
}

.searchButton {
  width: 40px;
  border: 1px solid #00B4CC;
  background: #00B4CC;
  text-align: center;
  color: #fff;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  font-size: 20px;
}
.wrap{
  width: 30%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#filter{
  color: white;
  padding: 5px;
  margin: 5px 30px;
  margin-top: 0%;
}
#filter.btn:hover{
  background-color: #00B4CC;
}
</style>