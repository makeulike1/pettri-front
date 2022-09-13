<script>
	import { Router, Route } from "svelte-navigator";
	import Dashboard 	from "./Dashboard.svelte"
	import Landing		from "./Landing.svelte"
	import Campaign 	from "./Campaign.svelte"
	import CampaignInfo from "./CampaignInfo.svelte";
	import Fraud 	from "./Fraud.svelte"
	import Tracking from "./Tracking.svelte"
	import Attr from "./Attr.svelte"
</script>

<main>
	<div class='top-cont'><span class='nav-open-menu' id='open-menu' onclick='openMenu()'>메뉴 펼치기</span></div>
	<div class='nav' id='left-menu'>
		<div class="top-nav">
			<a href='../index.html'><div class='nav-logout'>로그아웃</div></a>
			<div class='nav-close-out' onclick='closeMenu()'>메뉴닫기</div>
		</div>

		<Router>
			<ul class='nav-no-bullets'>
				<li>
					<a href ="/dashboard"><ul class='nav-link-li'><i class="bi bi-clipboard-data nav-icon"></i>대시보드</ul></a>
					<a href ="/campaign"><ul class='nav-link-li'><i class="bi bi-globe nav-icon"></i>캠페인</ul></a>
					<a href ="/landing"><ul class='nav-link-li'><i class="bi bi-gear nav-icon"></i>랜딩 설정</ul></a>
					<a href ="/tracking"><ul class='nav-link-li'><i class="bi bi-share nav-icon"></i>트래킹 링크</ul></a>
					<a href ="/fraud"><ul class='nav-link-li'><i class="bi bi-emoji-smile-fill nav-icon"></i>프로드 방지</ul></a>
					<a href ="/attr"><ul class='nav-link-li'><i class="bi bi-bar-chart nav-icon"></i>측정 모델 </ul></a>
					<!--a href ="/system"><ul class='nav-link-li'><i class="bi bi-gear nav-icon"></i>시스템 현황 </ul></a -->
				</li>
			</ul>
		</Router> 

	</div>
	<div class='cont' id='main'>
		

		<div class='mid-cont'>
			<Router>
				<!-- Router : Dashboard -->
				<Route path="/dashboard" primary={false}>
					<Dashboard/>
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

				<!-- Router : Fraud -->
				<Route path="/fraud" primary={false}>
					<Fraud/>
				</Route>

				<!-- Router : Attribution Model -->
				<Route path="/attr" primary={false}>
					<Attr/>
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
		padding-top:55px;
		padding-left:100px;
		padding-bottom:60px;
	}

	ul.nav-no-bullets{
        list-style-type: none; /* Remove bullets */
        padding:0;
    }



	.nav-icon{margin-right:20px;}
 

	.nav-open-menu{
		cursor:pointer; 
		font-weight:600;
		position:fixed;
		left:17px;
		font-size:16px;
		display:none;
		color:#00264d;
		top:14px;
		z-index:999;
	}

	.nav-open-menu:hover{
		text-decoration: underline;
	}

	.nav-close-out{
		color:#00264d; 
		font-size:16px; 
		cursor:pointer; 
		font-weight:600;
		position:absolute;
		left:15px;
	}

	.nav-close-out:hover{
		text-decoration:underline;
	}
	
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