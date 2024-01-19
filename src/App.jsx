import React from 'react'
import './App.css'

function App() {

  const [localMovieDatabase, setLocalMovieDatabase] = React.useState([])
  const [selectedMovie, setSelectedMovie] = React.useState()
  const [movieToDisplay, setMovieToDisplay] = React.useState()
  const [isHintAvailable, setIsHintAvailable] = React.useState(true)
  const [winState, setWinState] = React.useState(false)
  const [numberOfGuesses, setNumberOfGuesses] = React.useState(0)
  const [formData, setFormData] = React.useState('')
  const [lives, setLives] = React.useState(3)
  const [stats, setStats] = React.useState({
    'bestperformance': 0,
  })


  React.useEffect(()=> {                                     // Llamada a la API
    const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwM2NlZTg1ZDYwOGQ3NTRkNzE0YWRiMDlmMzI4MTE4MSIsInN1YiI6IjY1YTcxZDRiNTI5NGU3MDEzMGQyOTI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vF_3sze1K9_X8NeB95vQWqa2FXUA7v-dEH8enGVG03g'
      }
    };
  
    fetch(url, options)
      .then(res => res.json())
      .then(json => setLocalMovieDatabase(json.results))
      .catch(err => console.error('error:' + err));
    }
  , [])

  React.useEffect(()=>{                                      // Generador del display a partir de la película seleccionada

    let randomNSet = new Set()

    function getAllIndexes(arr, val) { // Guardo en un array (allSpaceIndexes) todas las instancias de un espacio en el título de la película
      arr.split('')
      let indexes = [], i = -1;
      while ((i = arr.indexOf(val, i+1)) != -1) {
          indexes.push(i);
      }
      return indexes;
    }

    let allSpaceIndexes = getAllIndexes(selectedMovie?.name || ' ', ' ')

    let prototypeDisplay = selectedMovie?.name.replaceAll(/\W/g, '').split('') // Le saco todos los caracteres no deseados al nombre de la película para que sea maleable
    let lettersToRemove = Math.ceil(prototypeDisplay?.length * 0.3)

    while (randomNSet.size < lettersToRemove) {
      randomNSet.add(Math.floor(Math.random()*prototypeDisplay.length))
    }

    randomNSet.forEach(value => { // Reemplazo los valores seleccionados al azar por guiones
      prototypeDisplay?.splice(value, 1, '_')
    })
    
    allSpaceIndexes.forEach((value, index) => { // Vuelvo a poner los espacios
      prototypeDisplay?.splice(value, 0, ' ')
    })

    setMovieToDisplay(prototypeDisplay)
  }, [selectedMovie])

  React.useEffect(()=>{
    let statsFromServer = JSON.parse(window.localStorage.getItem('userstats'))
    setStats(statsFromServer)
  }, [])

  const revealHint=()=> {              // Función para revelar las hints

    if (isHintAvailable) {
  
      function getAllIndexes(arr, val) { // Guardo en un array con todas las instancias de un GUION en el título de la película
        let indexes = [], i = -1;
        while ((i = arr.indexOf(val, i+1)) != -1) {
            indexes.push(i);
        }
        return indexes;
      }
  
      let allUnderscoreIndexes = getAllIndexes(movieToDisplay, '_')

      if (allUnderscoreIndexes.length === 1) {
        alert("The word only has one letter taken out, so no hint for you >:)")
      }
  
      let hintSet = new Set()
  
      while (hintSet.size < Math.floor(allUnderscoreIndexes.length / 2)) {
        hintSet.add(allUnderscoreIndexes[Math.floor(Math.random()*allUnderscoreIndexes.length)])
      }
  
      setMovieToDisplay(prev=>{
        let starterDisplayName = [...prev]
  
        hintSet.forEach(value => {
          starterDisplayName.splice(value, 1, selectedMovie?.name[value])
        })
  
        return starterDisplayName
      })
      setIsHintAvailable(false)
    }

    else alert('You have already used your hint!!')

  }



  const generateNewMovie=()=> {
    let newRandomMovieIndex = Math.floor(Math.random()*20)

    setSelectedMovie(prev => {
      if (prev?.id != localMovieDatabase[newRandomMovieIndex].id) { // Si la película seleccionada al azar no es la misma a la anterior, shippeala
        return localMovieDatabase[newRandomMovieIndex]
      }
      else if (newRandomMovieIndex == 0) {return localMovieDatabase[newRandomMovieIndex+1]} // Si es la misma a la anterior y es de index 0, devolvé la siguiente
      else return localMovieDatabase[newRandomMovieIndex-1] // Si es la misma a la anterior y no es de index 0, devolvé la anterior
    })


    setSelectedMovie(prev=>{
      return({
        ...prev,
        name: prev.name.replaceAll(/[^a-zA-Z0-9 ]/g, '')
      })
    })
  }

  const getMovieDisplay=()=> {
      return (
      <div className='movieToDisplay'>
        {movieToDisplay}
      </div>
      )
    }

  
  const checkAnswer=(event)=> {
    event.preventDefault()
    if (formData.toLowerCase() == selectedMovie?.name.toLowerCase() && formData != ' ') {
      setWinState(true)
      setNumberOfGuesses(prev=>prev+1)

      if (numberOfGuesses >= stats.bestperformance) {

        window.localStorage.setItem('userstats', JSON.stringify({
          bestperformance: numberOfGuesses+1
        }))
  
        setStats({
          bestperformance: numberOfGuesses+1
        })
      }
    }
    
    else {
      console.log('I hate you')
      setWinState(false)
      setLives(prev=>prev-1)
        
      if (lives === 1) {
        setWinState(true)
        alert('You lost! Start a new game and try again')
      }
    }

  }

  const resetGame=()=> {
    generateNewMovie()
    setWinState(false)
    setLives(3)
    setNumberOfGuesses(0)
    setIsHintAvailable(true)
  }

  const nextShow=()=> {
    if (winState && lives>0) {
      setWinState(false)
      generateNewMovie()
    } else console.log('ERROR: No lives available. Click the button above to start a new game')
  }

  return (
    <>
      <button onClick={resetGame}>Start new game</button>


        {movieToDisplay ? 

              <div className='conditionalContainer'>
            
                <p>{lives==1 ? `You have 1 life`: `You have ${lives} lives`}</p>

                <div style={{marginTop: '20px'}}>{getMovieDisplay() || 'Click the above button to start :)'}</div>

                <form onSubmit={checkAnswer}>
                  <input readOnly={winState} onChange={(event)=>{setFormData(event.target.value)}} type="text" name='movieInput'/>
                  <button disabled={winState} type='submit'>Submit your answer</button>
                </form>


                <button disabled={winState} onClick={revealHint}>Reveal hint</button>

                {winState && lives>0 ? 
                <button onClick={nextShow}>Next show</button> : null}

                <p>{numberOfGuesses ? 
                numberOfGuesses==1 ? '1 correct guess made this current round' : `${numberOfGuesses} guesses made this current round`
                : null}</p>

              </div>
        : null 
        }

        <p>Current record is {stats.bestperformance}</p>
    </>
  )
}
export default App
