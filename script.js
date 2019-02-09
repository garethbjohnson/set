const modalElement = document.getElementById('modal')
const tableElement = document.getElementById('table')

let deck = []
let selectedCards = []
let shownCards = []
let points = 0
let possibleSetIDArrays = []

function compareID(card1, card2) {
  if (card1.id < card2.id) {
    return -1
  } else if (card1.id > card2.id) {
    return 1
  } else {
    return 0
  }
}

const deselect = card => {
  card.element.classList.remove('selected')
  selectedCards = selectedCards.filter(selectedCard => selectedCard.id !== card.id)
}

const deselectAll = () => {
  selectedCards.map(card => deselect(card))
}

const getIsValidCardSet = (card1, card2, card3)=>
  getIsValidTraitSet(card1.color, card2.color, card3.color)
  && getIsValidTraitSet(card1.count, card2.count, card3.count)
  && getIsValidTraitSet(card1.shade, card2.shade, card3.shade)
  && getIsValidTraitSet(card1.shape, card2.shape, card3.shape)

const getIsValidTraitSet = (trait1, trait2, trait3) =>
  (trait1 === trait2 && trait1 === trait3)
  || (trait1 !== trait2 && trait1 !== trait3 && trait2 !== trait3)

const hideModal = () => {
  modalElement.classList.add('hidden')
}

const makeCardElement = ({ id, color, count, shade, shape }) => {
  const element = document.createElement('div')
  element.classList.add('card')
  element.dataset['id'] = String(id)
  element.onclick = () => select(id)

  for (let i = 0; i < count; i++) {
    element.innerHTML += makeShapeElementHTML({ color, shade, shape })
  }

  return element
}

const makeDeck = () => {
  const deck = []

  let id = 0

  for (color of ['green', 'purple', 'red']) {
    for (count of [1, 2, 3]) {
      for (shade of ['full', 'half', 'empty']) {
        for (shape of ['diamond', 'sausage', 'squiggle']) {
          const element = makeCardElement({ id, color, count, shade, shape })
          deck.push({ id, element, color, count, shade, shape })
          id++
        }
      }
    }
  }

  shuffle(deck)
  return deck
}

const makeShapeElementHTML = ({ color, shade, shape }) =>
  shape === 'sausage'
    ? `<div class='shape color-${color} shade-${shade} shape-${shape}'></div>`
    : makeShapeHTML({ color, shade, shape })

const makeShapeHTML = ({ color, shade, shape }) => {
  let pathShapeAttributeString = ''
  let fill = 'none'
  let pattern = ''

  if (shade === 'half') {
    fill = `url(#stripes-${color})`
    pattern = `
      <pattern
        id="stripes-${color}"
        height="6"
        width="6"
        patternTransform="translate(4)"
        patternUnits="userSpaceOnUse"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="6"
          stroke="${color}"
          stroke-width="6"
        />
      </pattern>
    `
  } else if (shade === 'full') {
    fill = color
  }

  if (shape === 'squiggle') {
    pathShapeAttributeString = `
      d="
        m 73.228964,48.592162
        c -6.09,0.07 -11.13,-0.38 -17,-2.22
          -6.57,-2.049996 -10.5,-5.199996 -18,-4.679996
          -13.78,0.94 -26.22,18.489996 -34.1699999,3.86
          -0.950004,-1.75 -1.700004,-4.02 -2.040004,-5.96
          -1.16,-4.58 -1,-10.45 0,-15
          1.06,-3.92 2.550004,-7.61 4.760004,-11
          1.86,-2.85 3.6799999,-4.9399997 6.4899999,-6.8999997
          19.26,-13.39 41.11,5.5499997 56.96,4.8599997
          16.99,-0.74 29.099998,-22.27 35.469996,-0.96
          3.4,20.78 -11.519996,37.759996 -32.469996,37.999996 z
      "
   `
  } else if (shape === 'diamond') {
    pathShapeAttributeString = `
      d="
        M 3,30
          60,3
          117,30
          60,57 Z
      "
    `
  } else {
    throw new Error('`makeShapeHTML` allows only a diamond or squiggle.')
  }

  return `
    <svg
      height="60px"
      width="120px"
      viewBox="0 0 120px 58.732px"
      xmlns="http://www.w3.org/2000/svg"
      style="overflow:visible"
    >
      ${pattern}
      <path
        ${pathShapeAttributeString}
        fill="${fill}"
        stroke="${color}"
        stroke-width="3"
      />
    </svg>
  `
}

const replace = card => {
  const shownCardsIndex = shownCards.indexOf(card)

  if (deck.length > 0) {
    const [newCard] = deck.splice(0, 1)
    shownCards[shownCardsIndex] = newCard
  } else {
    shownCards.splice(shownCardsIndex, 1)
  }
}

async function select(cardId) {
  const card = shownCards.find(shownCard => shownCard.id === cardId)

  const cardIsAlreadySelected = selectedCards.includes(card)
  if (cardIsAlreadySelected) {
    deselect(card)
    return
  }

  selectedCards.push(card)
  card.element.className += ' selected'

  if (selectedCards.length === 3) {
    const cardsAreValidSet = getIsValidCardSet(...selectedCards)

    if (cardsAreValidSet) {
      await showModal('🎉')
      points++
      showPoints()
      selectedCards.map(selectedCard => replace(selectedCard))
      showCards()
      deselectAll()
      showPossibleSetsCount()
    } else {
      await showModal('❌')
      deselectAll()
    }
  }
}

function setPossibleSetIDArrays() {
  let possibleSetIDArrayStrings = new Set()

  const sortedShownCards = shownCards.slice().sort(compareID)

  for (let index1 = 0; index1 < sortedShownCards.length; index1 += 1) {
    const card1 = sortedShownCards[index1]
    const shownCardsAfterCard1 = sortedShownCards.slice(index1 + 1)

    for (let index2 = 0; index2 < shownCardsAfterCard1.length; index2 += 1) {
      const card2 = shownCardsAfterCard1[index2]
      const shownCardsAfterCard2 = shownCardsAfterCard1.slice(index2 + 1)

      for (let index3 = 0; index3 < shownCardsAfterCard2.length; index3 += 1) {
        const card3 = shownCardsAfterCard2[index3]

        const cardsAreValidSet = getIsValidCardSet(card1, card2, card3)

        if (cardsAreValidSet) {
          let setIDs = [card1.id, card2.id, card3.id]
          setIDs.sort()
          const setIDsString = JSON.stringify(setIDs)
          possibleSetIDArrayStrings.add(setIDsString)
        }
      }
    }
  }

  possibleSetIDArrayStrings = Array.from(possibleSetIDArrayStrings)
  possibleSetIDArrayStrings.sort()

  possibleSetIDArrays = possibleSetIDArrayStrings.map(string => JSON.parse(string))
}

const showCards = () => {
  tableElement.innerHTML = ''

  shownCards.map(card => {
    tableElement.append(card.element)
  })
}

async function showHint() {
  if (possibleSetIDArrays.length === 0) {
    return
  }

  const selectedCardIDs = selectedCards.map(card => card.id)

  let possibleSetIDs = possibleSetIDArrays.reduce((array1, array2) => array1.concat(array2))
  possibleSetIDs = new Set(possibleSetIDs)
  possibleSetIDs = Array.from(possibleSetIDs).filter(id => !selectedCardIDs.includes(id))

  shuffle(possibleSetIDs)
  const randomID = possibleSetIDs[0]

  const card = shownCards.find(shownCard => shownCard.id === randomID)
  card.element.className += ' hint'

  await new Promise(resolve =>
    setTimeout(
      () => {
        card.element.classList.remove('hint')
        resolve()
      },
      1000
    )
  )
}

async function showModal(content) {
  const modalContentElement = document.getElementById('modal-content')
  modalContentElement.innerHTML = content

  modalElement.classList.remove('hidden')

  await new Promise(resolve =>
    setTimeout(
      () => {
        hideModal()
        resolve()
      },
      1000
    )
  )
}

function showPoints() {
  const pointsElement = document.getElementById('points')
  pointsElement.innerText = String(points)
}

function showPossibleSetsCount() {
  const possibleSetsElement = document.getElementById('possible-sets')
  setPossibleSetIDArrays()
  possibleSetsElement.innerText = String(possibleSetIDArrays.length)
}

const shuffle = items => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    )

    const itemI = items[i]
    const itemJ = items[j]

    items[i] = itemJ
    items[j] = itemI
  }
}

const start = () => {
  deck = makeDeck()
  shownCards = deck.splice(0, 12)
  selectedCards = []
  showCards()

  points = 0
  showPoints()
  showPossibleSetsCount()
}

start()
