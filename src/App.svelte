<script>
	import { Router, Route, Link} 			from "yrv";
	import Landing						from "./Landing.svelte"
	import Campaign 					from "./Campaign.svelte"
	import CampaignInfo					from "./CampaignInfo.svelte"
	import Partner 						from "./Partner.svelte";
	import Fraud 						from "./Fraud.svelte"
	import Tracking 					from "./Tracking.svelte"
	import Attr 						from "./Attr.svelte"
	import Dashboard  					from "./Dashboard.svelte"
	import Temp  					from "./Temp.svelte"
	import Test10 						from "./Test10.svelte"
    
	let currentURL = new URL(window.location.href)
	let appId   = currentURL.searchParams.get("app_id") 


</script>

<main>

	<div class='top-cont'>
	</div>

	
		<div class='nav' id='left-menu'>
			<div class="top-nav">
				<a href='../index.html'><div class='nav-logout'>로그아웃</div></a>
			</div>
			<ul class='nav-no-bullets'>
				<li>
					<Link href ="/dashboard?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-file-bar-graph nav-icon"></i>대시보드</ul></Link>
					<Link href ="/temp?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-file-bar-graph nav-icon"></i>대시보드 (임시)</ul></Link>
					<Link href ="/campaign?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-globe nav-icon"></i>캠페인</ul></Link>
					<!-- Link href ="/partner?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-person nav-icon"></i>광고 파트너</ul></Link -->
					<Link href ="/landing?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-gear nav-icon"></i>랜딩 설정</ul></Link>
					<!-- Link href ="/tracking?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-share nav-icon"></i>트래킹 링크</ul></Link>
					<Link href ="/fraud?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-emoji-smile-fill nav-icon"></i>프로드 방지</ul></Link -->
					<Link href ="/attr?app_id={appId}"><ul class='nav-link-li'><i class="bi bi-bar-chart nav-icon"></i>측정 모델 </ul></Link>
				</li>
			</ul>
		</div>
		<div class='cont' id='main'>
			

			<div class='mid-cont'>
				<Router>
					<!-- Router : Tracking Link -->
					<Route path="/dashboard" primary={false}>
						<Dashboard/>
					</Route>

					<!-- Router : Tracking Link -->
					<Route path="/temp" primary={false}>
						<Temp/>
					</Route>

					<!-- Router : Tracking Link -->
					<Route path="/test10" primary={false}>
						<Test10/>
					</Route>

						
					<!-- Router : Tracking Link -->
					<Route path="/tracking" primary={false}>
						<Tracking/>
					</Route>

					<!-- Router : Landing -->
					<Route path="/landing" primary={false}>
						<Landing/>
					</Route>

					<!-- Router : Campaign -->
					<Route path="/campaign" primary={false}>
						<Campaign/>
					</Route>

					<!-- Router : Campaign Info -->
					<Route path="/campaign-info" primary={false}>
						<CampaignInfo/>
					</Route>

					<!-- Router : Fraud -->
					<Route path="/fraud" primary={false}>
						<Fraud/>
					</Route>

					<!-- Router : Attribution Model -->
					<Route path="/attr" primary={false}>
						<Attr/>
					</Route>

					<!-- Router : Partner -->
					<Route path="/partner" primary={false}>
						<Partner/>
					</Route>
				</Router>
			</div>

			
		</div>

</main>




<style>
	
	main{
		width:100%;
		height:100%;
	}

	.top-nav {
		height:50px;
		width:100%;
		line-height:50px;
		
	}

	.cont {
		height:100%;
		display:inline-block;
		position:relative;
		left:350px;
	}

	.nav {
		width:350px;
		height:100%;
		border-right:1px solid #ececec;
		display:inline-block;
		background-color: white;
		position:fixed;

		list-style-type: none; /* Remove bullets */
		padding: 0; /* Remove padding */
		margin: 0; /* Remove margins */
		top:0;
		z-index:999;
	}


	

	.top-cont{
		height:50px;
		padding-top:11px;
		padding-left:20px;
		font-weight:500;
		color:#00264d;
		width:100%;

	}

	.mid-cont{
		padding-top:40px;
		padding-left:80px;
		padding-bottom:60px;
	}

	ul.nav-no-bullets{
        list-style-type: none; /* Remove bullets */
        padding:0;
    }
 
	.nav-icon{margin-right:20px;}
  
 
	.nav-logout{
		color:#00264d; 
		font-size:16px; 
		cursor:pointer; 
		font-weight:600;
		position:absolute;
		right:15px;
	}

	.nav-logout:hover{
		text-decoration:underline;
	}
	
	
</style>