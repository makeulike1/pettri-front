 <script>
  import { Router, Route, Link } from "yrv";
  import CPT    from "./campaign/TrackingLink.svelte"
  import CPK    from "./campaign/KPI.svelte"
  import CPP    from "./campaign/Postback.svelte"
  import CPF    from "./campaign/Fraud.svelte"

  import CCTL   from "./campaign/CreateTrackingLink.svelte"

   let currentURL   = new URL(window.location.href)
   let appId        = currentURL.searchParams.get("app_id")
   let campaignId   = currentURL.searchParams.get("campaign_id")
   

 </script>

 <ul class="nav">
  <li class="nav-item">
  
      <Link href="/campaign-info/cpt" class="nav-link campaign">트래킹 링크</Link>
      <Link href="/campaign-info/cpk" class="nav-link campaign">KPI 목표 설정</Link>
      <Link href="/campaign-info/cpp" class="nav-link campaign">포스트백 설정</Link>
      <Link href="/campaign-info/cpf" class="nav-link campaign">프로드 설정</Link>
      <br>  
      <Router>
          <Route path="/cpt"><CPT appId={appId} campaignId={campaignId}/></Route>
          <Route path="/cpk"><CPK appId={appId} campaignId={campaignId}/></Route>
          <Route path="/cpp"><CPP appId={appId} campaignId={campaignId}/></Route>
          <Route path="/cpf"><CPF appId={appId} campaignId={campaignId}/></Route>
          <Route path="/cctl"><CCTL appId={appId} campaignId={campaignId}/></Route>
      </Router>
      
     
  </li>
</ul>



<style>

 
</style>