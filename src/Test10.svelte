<script>
    
    let currentURL = new URL(window.location.href)
    let appId   = currentURL.searchParams.get("app_id")
    let dashboardId = currentURL.searchParams.get("dashboard_id")

</script>
<button type="button" class="btn btn-primary add-widget" data-dismiss="modal">+ Add Widget</button>
<div class='board'>
    <div class='row'>
        <div class='widget'><h3>Widget 1</h3></div>
        <div class='widget'><h3>Widget 2</h3></div>
        <div class='widget'><h3>Widget 3</h3></div>
    </div>
    <div class='row'>
        <div class='widget'><h3>Widget 4</h3></div>
        <div class='widget'><h3>Widget 5</h3></div>
        <div class='widget'><h3>Widget 6</h3></div>
    </div>
    <div class='row'>
        <div class='widget'><h3>Widget 7</h3></div>
        <div class='widget'><h3>Widget 8</h3></div>
        <div class='widget'><h3>Widget 9</h3></div>
    </div>
</div>
<style>
    .board{
        background-color:#ececec;
        width:1200px;
        height:1000px;
        display:block;
        margin-top:50px;
        border:1px solid #bdbdbd;
    }

    .board .row{
        padding-top:50px;
    }
    .board .row .widget{
        width:300px; height:200px;
        background-color:white;
        box-shadow:  1px 8px 0 rgb(0 0 0 / 10%);
        position:relative;
        margin-left:70px;
    }

</style>