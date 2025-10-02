

const urlBase = "https://pokeapi.co/api/v2/pokemon";
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');
const infoPagina   = document.getElementById('infoPagina');

let tamPagina = 25;  
let pagina    = 1;   
let total     = 0;   

function actualizarPaginacion() {
  const totalPaginas = Math.ceil(total / tamPagina) || 1;

  if (infoPagina) {
    infoPagina.textContent = `Página ${pagina} de ${totalPaginas}`;
    infoPagina.style.color = '#ffffff';
  }

  const prevNum = Math.max(1, pagina - 1);
  const nextNum = Math.min(totalPaginas, pagina + 1);

  if (btnAnterior) {
    btnAnterior.disabled = pagina <= 1;
    if (pagina <= 1) {
      btnAnterior.textContent = '« Anterior';
      btnAnterior.style.color = '#555555';
    } else{
    btnAnterior.textContent = `« Anterior (${prevNum})`;
    btnAnterior.style.color = '#ffffff';
    }
  }

  if (btnSiguiente) {
    btnSiguiente.disabled = pagina >= totalPaginas;
    if (pagina >= totalPaginas) {
      btnSiguiente.textContent = 'Siguiente »';
      btnSiguiente.style.color = '#555555';
    } else{
    btnSiguiente.textContent = `Siguiente (${nextNum}) »`;
    btnSiguiente.style.color = '#ffffff';
  }
}
}


btnAnterior?.addEventListener('click', () => {
  if (pagina > 1) { pagina--; 
    cargarPagina(pagina);
    actualizarPaginacion(); 
   }
  
});
btnSiguiente?.addEventListener('click', () => {
  const totalPaginas = Math.ceil(total / tamPagina) || 1;
  if (pagina < totalPaginas) { pagina++; 
    cargarPagina(pagina); 
actualizarPaginacion()}
    
});

const listaPokemones = document.getElementById('pokemones');
const favoritosCon = document.getElementById('favoritos');
let favoritos = []; 

const favoritosGuardados = localStorage.getItem('favoritos');
if (favoritosGuardados) {
  const raw = JSON.parse(favoritosGuardados);
  favoritos = raw.map(item =>
    typeof item === 'string' ? { nombre: item, img: null } : item
  );
}

let ultimos = [];

const ultimosGuardados = localStorage.getItem('ultimos');
if (ultimosGuardados) {
  const rawU = JSON.parse(ultimosGuardados);
  ultimos = rawU.map(item =>
    typeof item === 'string' ? { nombre: item, img: null } : item
  );
}

function guardarUltimo(nombre, img) {
  const n = (nombre || '').trim().toLowerCase();
  if (!n) return;
  const nuevo = { nombre: n, img: img || null };
  ultimos = [nuevo, ...ultimos.filter(u => u.nombre !== n)].slice(0, 10);
  localStorage.setItem('ultimos', JSON.stringify(ultimos));
}




async function renderFavoritos() {
  favoritosCon.innerHTML = '';
  const btnVolver = document.createElement('button');
    btnVolver.textContent = 'Volver';
    btnVolver.className = 'volverLista';

    favoritosCon.appendChild(btnVolver);

    btnVolver.addEventListener('click', () => {
    vistaActual = "favoritos";
    favoritosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    cargarPagina(pagina);
  });
  if (favoritos.length === 0) {
    favoritosCon.innerHTML = '<li>No hay favoritos aún.</li>';
    const btnVolver = document.createElement('button');
    btnVolver.textContent = 'Volver';
    btnVolver.className = 'volverLista';

    favoritosCon.appendChild(btnVolver);

    btnVolver.addEventListener('click', () => {
    vistaActual = "favoritos";
    favoritosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    cargarPagina(pagina);
  });
    return;
  }
  

  for (const fav of favoritos) {
    if (!fav.img) {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(fav.nombre.toLowerCase())}`);
        const det = await res.json();
        fav.img =
          det?.sprites?.other?.['official-artwork']?.front_default ||
          det?.sprites?.front_default ||
          '';
        localStorage.setItem('favoritos', JSON.stringify(favoritos)); 
      } catch (e) {
        console.error('No pude recuperar imagen de', fav.nombre, e);
        fav.img = '';
      }
    }

    const card = document.createElement('div');
    card.className = 'favoritoCard';

    const imagen = document.createElement('img');
    imagen.className = 'favoritoImg';
    imagen.alt = fav.nombre;
    imagen.src = fav.img || '';

    const nombrePoke = document.createElement('p');
    nombrePoke.textContent = fav.nombre;
    nombrePoke.className = 'favoritoNombre';

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = '✖';
    btnEliminar.className = 'eliminarFavorito';

        

    card.addEventListener('click', async () => {
  try {
    vistaActual = "favoritos";
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(fav.nombre.toLowerCase())}`);
    const det = await res.json();
    renderDetalle(det);
  } catch (e) {
    console.error('No pude cargar detalle de', fav.nombre, e);
  }
});

    btnEliminar.onclick = (ev) => {
      ev.stopPropagation();
      favoritos = favoritos.filter(f => f.nombre !== fav.nombre);
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
       renderFavoritos();
      
    };


    card.appendChild(imagen);
    card.appendChild(nombrePoke);
    card.appendChild(btnEliminar);
    favoritosCon.appendChild(card);
    
    
  }
  
}

async function buscarPokemon() {
  const input = document.getElementById('nombre');
  const term = (input?.value || '').trim().toLowerCase();
  if (!term) return;

  try {

    const url = `${urlBase}/${encodeURIComponent(term)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Pokémon no encontrado');

    const det = await res.json();
    const img =
      det?.sprites?.other?.['official-artwork']?.front_default ||
      det?.sprites?.front_default || null;

    guardarUltimo(det.name, img);
    renderDetalle(det);
  } catch (e) {
    console.error(e);
    panDet.innerHTML = `<button id="cerrarDetalle">Cerrar</button><p>Pokémon no encontrado</p>`;
    listaPokemones.style.display = "none";
    favoritosDiv.style.display   = "none";
    btnAnterior.style.display = 'none';
    btnSiguiente.style.display = 'none';
    infoPagina.style.display = 'none'; 
    ultimosDiv.style.display = 'none';
    panDet.classList.add("mostrar");

    document.getElementById('cerrarDetalle').addEventListener('click', () => {
    panDet.classList.remove('mostrar');
    panDet.innerHTML = '';
    if (vistaActual === "favoritos") {
      favoritosDiv.style.display = "block";
    } else {
      listaPokemones.style.display = "flex"
      btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';;
    }
  });
  }
}

document.getElementById('stakeholder').addEventListener('submit', (e) => {
  e.preventDefault();        
  buscarPokemon();
});



const btnFavoritos = document.getElementById('botonFavoritos');
const favoritosDiv = document.getElementById('favoritosContainer');

;


btnFavoritos.addEventListener('click', () => {
  if (favoritosDiv.style.display === 'none' || favoritosDiv.style.display === '') {
    vistaActual = "favoritos";
    favoritosDiv.style.display = 'block';
    listaPokemones.style.display = 'none';
    btnAnterior.style.display = 'none';
    btnSiguiente.style.display = 'none';
    ultimosDiv.style.display = 'none'; 
    infoPagina.style.display = 'none'; 
    
    panDet.classList.remove('mostrar'); 
    panDet.innerHTML = '';
    renderFavoritos();
  } else {
    vistaActual = "lista";
    favoritosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    infoPagina.style.display = 'flex'; 
    ultimosDiv.style.display = 'none'; 
    panDet.classList.remove('mostrar'); 
    panDet.innerHTML = '';
    cargarPagina(pagina);
  }
});


const panDet = document.getElementById('detallePokemon');
let vistaActual = "lista"; 

function renderDetalle(det) {
  const img =
    det?.sprites?.other?.['official-artwork']?.front_default ||
    det?.sprites?.front_default || '';

  const tipos = (det.types || []).map(t => t.type.name).join(', ');
  const habilidades = (det.abilities || []).map(a => a.ability.name).join(', ');
  const estadisticas = (det.stats || []).map(s => `${s.stat.name}: ${s.base_stat}`).join(' | ');

  panDet.innerHTML = `
    <button id="cerrarDetalle">Cerrar</button>
     <button id="btnAgregarFavorito" class="botonFavoritos">★</button>
    <div class="detalleHeader">
      <img src="${img}" alt="${det.name}">
      <div>
        <div><strong>#${det.id}</strong> ${det.name}</div>
        <div>Tipos: ${tipos}</div>
        <div>Altura: ${det.height} | Peso: ${det.weight}</div>
        <div>Habilidades: ${habilidades}</div>
      </div>
    </div>
    <div>Stats → ${estadisticas}</div>
  `;
  
  listaPokemones.style.display = "none";
  favoritosDiv.style.display   = "none";
  btnAnterior.style.display = 'none';
    btnSiguiente.style.display = 'none';
    ultimosDiv.style.display = 'none'; 
    infoPagina.style.display = 'none'; 
  panDet.classList.add("mostrar");
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const btnAgregado= document.getElementById('btnAgregarFavorito');

  if (favoritos.some(fav => fav.nombre === det.name)) {
    btnAgregado.textContent = '✖'; 
    btnAgregado.style.background = '#910909';
    }else{
      btnAgregado.textContent = '★';
      btnAgregado.style.background = ' rgba(141, 141, 141, 0.947)';
    }
  
  btnAgregado.onclick = () => {
    if (btnAgregado.textContent === '★') { 
if (favoritos.length >= 50) {
  alert('Límite de 50 alcanzado, elimina alguno para agregar más.');
  return;
}
      favoritos.push({ nombre: det.name, img });
       localStorage.setItem('favoritos', JSON.stringify(favoritos));
       btnAgregado.textContent = '✖';
       btnAgregado.style.background = '#910909';
            renderFavoritos();
        
          }
          else{
            favoritos = favoritos.filter(fav => fav.nombre !== det.name);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            btnAgregado.textContent = '★';
            btnAgregado.style.background = ' rgba(141, 141, 141, 0.947)';
            renderFavoritos();
          }
        };

  document.getElementById('cerrarDetalle').addEventListener('click', () => {
    panDet.classList.remove('mostrar');
    panDet.innerHTML = '';
    if (vistaActual === "favoritos") {
      favoritosDiv.style.display = "block";
    } else if (vistaActual === "ultimos") {
        ultimosDiv.style.display = "block";
    renderUltimos();
}
        else {
      listaPokemones.style.display = "flex"
      btnAnterior.style.display = 'flex';
        btnSiguiente.style.display = 'flex';
        infoPagina.style.display = 'flex'; 
     cargarPagina(pagina);
    }
  });
}

async function renderUltimos() {
  const ultimosCon = document.getElementById('ultimos');
  ultimosCon.innerHTML = '';
    const btnVolver = document.createElement('button');
    btnVolver.textContent = 'Volver';
    btnVolver.className = 'volverLista';

    ultimosCon.appendChild(btnVolver);

    btnVolver.addEventListener('click', () => {
    vistaActual = "ultimos";
    favoritosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    ultimosDiv.style.display = 'none';
    infoPagina.style.display = 'flex'; 

  });
  

  if (!ultimos || ultimos.length === 0) {
    ultimosCon.innerHTML = '<li>No hay búsquedas recientes.</li>';
    const btnVolver = document.createElement('button');
    btnVolver.textContent = 'Volver';
    btnVolver.className = 'volverLista';

    ultimosCon.appendChild(btnVolver);

    btnVolver.addEventListener('click', () => {
    vistaActual = "ultimos";
    favoritosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    ultimosDiv.style.display = 'none';
  });
    return;
  }

  for (const u of ultimos) {
    if (!u.img) {
      try {
        const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(u.nombre.toLowerCase())}`);
        const det = await r.json();
        u.img =
          det?.sprites?.other?.['official-artwork']?.front_default ||
          det?.sprites?.front_default || '';
        localStorage.setItem('ultimos', JSON.stringify(ultimos));
      } catch {
        u.img = '';
      }
    }

    const card = document.createElement('div');
    card.className = 'favoritoCard';

    const imagen = document.createElement('img');
    imagen.className = 'favoritoImg';
    imagen.alt = u.nombre;
    imagen.src = u.img || '';

    const nombreEl = document.createElement('p');
    nombreEl.className = 'favoritoNombre';
    nombreEl.textContent = u.nombre;

    const botonFavoritos = document.createElement('button');
    if( favoritos.some(fav => fav.nombre === u.nombre)) {
          botonFavoritos.textContent = '✖';
            botonFavoritos.style.background = '#910909';
        } else {
          botonFavoritos.textContent = '★';
          botonFavoritos.style.background = ' rgba(141, 141, 141, 0.947)';
        }
        botonFavoritos.className = 'botonFavoritos';

        botonFavoritos.onclick = (ev) => {
           ev.stopPropagation(); 
           if (botonFavoritos.textContent === '★') {
            if (favoritos.length >= 50) {
  alert('Límite de 50 alcanzado, elimina alguno para agregar más.');
  return;
            }
            favoritos.push({ nombre: u.nombre, imagen: u.img });
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            botonFavoritos.textContent = '✖';
            botonFavoritos.style.background = '#910909';
            renderFavoritos();
          } else {
            favoritos = favoritos.filter(fav => fav.nombre !== u.nombre);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            botonFavoritos.textContent = '★';
            botonFavoritos.style.background = ' rgba(141, 141, 141, 0.947)';
            renderFavoritos();
          
          }
        };
         

    card.addEventListener('click', async () => {
      try {
        vistaActual = "ultimos";
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(u.nombre.toLowerCase())}`);
        const det = await res.json();
        renderDetalle(det);
      } catch (e) {
        console.error('No pude cargar detalle de', u.nombre, e);
      }
    });

    card.appendChild(imagen);
    card.appendChild(nombreEl);
    card.appendChild(botonFavoritos);
    ultimosCon.appendChild(card);
  }
}

const btnUltimos = document.getElementById('botonUltimos');
const ultimosDiv = document.getElementById('ultimosContainer');

btnUltimos?.addEventListener('click', (ev) => {
  ev.preventDefault();
if (ultimosDiv.style.display === 'none' || ultimosDiv.style.display === '') {
  vistaActual = "ultimos";
  ultimosDiv.style.display     = 'block';
  favoritosDiv.style.display   = 'none';
  listaPokemones.style.display = 'none';
    btnAnterior.style.display = 'none';
    btnSiguiente.style.display = 'none';
    infoPagina.style.display = 'none'; 
}else{
    vistaActual = "lista";
    ultimosDiv.style.display = 'none';
    listaPokemones.style.display = 'flex';
    favoritosDiv.style.display   = 'none';
    btnAnterior.style.display = 'flex';
    btnSiguiente.style.display = 'flex';
    infoPagina.style.display = 'flex'; 
    cargarPagina(pagina);
}

  panDet.classList.remove('mostrar');
  panDet.innerHTML = '';

  renderUltimos();
});



  async function cargarPagina(p) {
  listaPokemones.innerHTML = '';
  vistaActual = "lista";

  const offset = (p - 1) * tamPagina;   
  const url = `${urlBase}?offset=${offset}&limit=${tamPagina}`; 

  try {
    const res = await fetch(url);
    const data = await res.json();
    total = data.count || 0;

    for (const pokemon of data.results) {
        actualizarPaginacion();
      try {
        const detalleRes = await fetch(pokemon.url);
        const detalle = await detalleRes.json();

        const img =
          detalle?.sprites?.other?.['official-artwork']?.front_default ||
          detalle?.sprites?.front_default ||
          '';

        const card = document.createElement('div');
        card.className = 'pokemonCard';

        const imagen = document.createElement('img');
        imagen.className = 'pokemonImg';
        imagen.alt = pokemon.name;
        imagen.src = img;

        const nombre = document.createElement('p');
        nombre.className = 'pokemonNombre';
        nombre.textContent = pokemon.name;

        const botonFavoritos = document.createElement('button');
    
        if( favoritos.some(fav => fav.nombre === pokemon.name)) {
          botonFavoritos.textContent = '✖';
            botonFavoritos.style.background = '#910909';
        } else {
          botonFavoritos.textContent = '★';
          botonFavoritos.style.background = ' rgba(141, 141, 141, 0.947)';
        }
        botonFavoritos.className = 'botonFavoritos';
        
        card.addEventListener('click', () => {
          vistaActual = "lista";
          renderDetalle(detalle);
        });

        
        botonFavoritos.onclick = (ev) => {
           ev.stopPropagation(); 
           if (botonFavoritos.textContent === '★') {
            if (favoritos.length >= 50) {
            alert('Límite de 50 alcanzado, elimina alguno para agregar más.');
             return;
            }
            favoritos.push({ nombre: pokemon.name, img });
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            botonFavoritos.textContent = '✖';
            botonFavoritos.style.background = '#910909';
            renderFavoritos();
          } else {
            favoritos = favoritos.filter(fav => fav.nombre !== pokemon.name);
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            botonFavoritos.textContent = '★';
            botonFavoritos.style.background = ' rgba(141, 141, 141, 0.947)';
            renderFavoritos();
          
          }
        };

        card.appendChild(imagen);
        card.appendChild(nombre);
        card.appendChild(botonFavoritos);

        listaPokemones.appendChild(card);
      } catch (e) {
        console.error('Error con', pokemon.name, e);
      }
    }
  } catch (err) {
    console.error('Error al cargar página:', err);
  }
}cargarPagina(pagina);






