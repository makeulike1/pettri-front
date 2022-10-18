 <script>
  import { Router, Route, Link } from "yrv";
  import CPD		from "./campaign/Dashboard.svelte"
  import CPT    from "./campaign/TrackingLink.svelte"
  import CPK    from "./campaign/KPI.svelte"
  import CPP    from "./campaign/Postback.svelte"
  import CPF    from "./campaign/Fraud.svelte"

   let currentURL = new URL(window.location.href)
   let appId       = currentURL.searchParams.get("app_id")
   

 </script>

 <ul class="nav">
  <li class="nav-item">
  
      <Link href="/campaign-info/cpd" class="nav-link campaign active">대시보드</Link>
      <Link href="/campaign-info/cpt" class="nav-link campaign active">트래킹 링크</Link>
      <Link href="/campaign-info/cpk" class="nav-link campaign active">KPI 목표 설정</Link>
      <Link href="/campaign-info/cpp" class="nav-link campaign active">포스트백 설정</Link>
      <Link href="/campaign-info/cpf" class="nav-link campaign active">프로드 설정</Link>
      <br>  
      <Router>
          <Route path="/cpd"><CPD/></Route>
          <Route path="/cpt"><CPT/></Route>
          <Route path="/cpk"><CPK/></Route>
          <Route path="/cpp"><CPP/></Route>
          <Route path="/cpf"><CPF/></Route>
      </Router>
      
     
  </li>
</ul>

<style></style>