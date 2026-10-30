function cargarDashboard(data){

    window.dashboardData = data;
    actualizarHero(data);
    actualizarDecisiones(data);
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
function actualizarDecisiones(data){
    const definiciones =
        data["Definiciones pendientes"];
    const contenedor =
        document.getElementById("decisiones");
    if(!definiciones || !contenedor){
        return;
    }
    contenedor.innerHTML = "";
    definiciones.slice(1).forEach(fila => {
        const texto = fila[1];     // Columna B
        const prioridad = fila[6]; // Columna G
        const estatus = fila[5];   // Columna F
        if(
            String(estatus)
            .trim()
            .toLowerCase() === "cerrado"
        ){
            return;
        }
        let clase = "level--medio";
        if(
            String(prioridad)
            .toLowerCase()
            .includes("alta")
        ){
            clase = "level--alto";
        }
        contenedor.innerHTML += `
            <li>
                <div class="decision__head">
                    <p class="decision__title">
                        ${texto}
                    </p>
                    <span class="level ${clase}">
                        ${prioridad}
                    </span>
                </div>
            </li>
        `;
    });
}
