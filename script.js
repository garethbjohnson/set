// TODO: Allow resets.
// TODO: Track points.

const modalElement = document.getElementById('modal')
const tableElement = document.getElementById('table')

let deck = []
let selectedCards = []
let shownCards = []

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
    element.innerHTML += `<div class='shape color-${color} shade-${shade} shape-${shape}'></div>`
  }

  return element
}

const makeDeck = () => {
  const deck = []

  let id = 0

  // for (color of ['green', 'purple', 'red']) {
  for (color of ['red']) {
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

const replace = card => {
  const shownCardsIndex = shownCards.indexOf(card)

  if (deck.length > 0) {
    const [newCard] = deck.splice(0, 1)
    shownCards[shownCardsIndex] = newCard
  } else {
    shownCards.splice(shownCardsIndex, 1)
  }
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

const shuffle = cards => {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    )

    const cardI = cards[i]
    const cardJ = cards[j]

    cards[i] = cardJ
    cards[j] = cardI
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
      selectedCards.map(selectedCard => replace(selectedCard))
      showCards()
      deselectAll()
    } else {
      showModal('❌')
      deselectAll()
    }
  }
}

const showCards = () => {
  tableElement.innerHTML = ''

  shownCards.map(card => {
    tableElement.append(card.element)
  })
}

const start = () => {
  deck = makeDeck()
  shownCards = deck.splice(0, 12)
  selectedCards = []
  showCards()
}

start()
