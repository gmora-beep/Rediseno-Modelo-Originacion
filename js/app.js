function cargarDashboard(data){
    console.log(data);
    window.dashboardData = data;
    actualizarHero(data);
}
function actualizarHero(data){

    const onePage = data["One page"];

    if(!onePage || onePage.length < 4){
        return;
    }

    let sesiones = 0;
    let registradas = 0;
    let cerradas = 0;
    let abiertas = 0;

    for(let i = 1; i < onePage.length; i++){

        sesiones += Number(onePage[i][2]) || 0;

        registradas += Number(onePage[i][5]) || 0;

        cerradas += Number(onePage[i][6]) || 0;

        abiertas += Number(onePage[i][7]) || 0;

    }

    document.getElementById("hero-sesiones").textContent = sesiones;
    document.getElementById("hero-registradas").textContent = registradas;
    document.getElementById("hero-cerradas").textContent = cerradas;
    document.getElementById("hero-abiertas").textContent = abiertas;

}
