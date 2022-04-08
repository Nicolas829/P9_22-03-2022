/**
 * @jest-environment jsdom
 */
/* istanbul ignore next */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"


window.alert = jest.fn()
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I can see the title ", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillContent = screen.getByTestId("newbill-title")
      expect(newBillContent.textContent).toBe('Envoyer une note de frais')

    })
  })
})
describe("Given I'm on the newBill page", () => {
  describe('When I would like to fill the form', () => {
    test("Then I can see the form ", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const formContent = screen.getByTestId("form-new-bill")
      expect(formContent).toBeTruthy()
    })
    test('Then I can fill the form', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const expenseType = screen.getByTestId("expense-type")
      console.log(expenseType.textContent)
      expect(expenseType.textContent).toContain("Transports")
    })
    test('Then i can see the button to upload file', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const chooseFile = screen.getByTestId('file')
      expect(chooseFile.className).toBe('form-control blue-border')
    })
    test('Then the file format upload is not supported', () => {
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const store = null
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const chooseFile = screen.getByTestId('file')

      chooseFile.addEventListener("change", handleChangeFile)

      fireEvent.change(chooseFile, {
        target: {
          files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(window.alert.mock.calls.length).toBe(1)

    })
  })
})



describe("Given I am a user connected as Employee", () => {
  describe("When i navigate to NewwBill", () => {
    test('Post newBill to mock Api POST', async () => {

      const html = NewBillUI()
      document.body.innerHTML = html
      const store = null
      const inputData = {
        type: "Restaurants et bars",
        name: 'Restaurant Kirk',
        amount: '12',
        date: '2022-02-04',
        vat: '100',
        pct: "20",
        commentary: "test",
        fileUrl: "https://test.com",
        fileName: "FactureKirk.jpg",
        status: "pending"
      };
      const form = screen.getByTestId("form-new-bill")
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const updateBill = jest.spyOn(newBill, 'updateBill')
      const type = screen.getByTestId("expense-type")
      const name = screen.getByTestId("expense-name")
      const amount = screen.getByTestId("amount")
      const date = screen.getByTestId("datepicker")
      const vat = screen.getByTestId("vat")
      const pct = screen.getByTestId("pct")
      const commentary = screen.getByTestId("commentary")

      fireEvent.change(type, { target: { value: inputData.type } })
      fireEvent.change(name, { target: { value: inputData.name } })
      fireEvent.change(amount, { target: { value: inputData.amount } })
      fireEvent.change(date, { target: { value: inputData.date } })
      fireEvent.change(vat, { target: { value: inputData.vat } })
      fireEvent.change(pct, { target: { value: inputData.pct } })
      fireEvent.change(commentary, { target: { value: inputData.commentary } })
      newBill.fileName = inputData.fileName
      newBill.fileUrl = inputData.fileUrl
      expect(type.value).toBe(inputData.type)
      expect(name.value).toBe(inputData.name)
      expect(amount.value).toBe(inputData.amount)
      expect(date.value).toBe(inputData.date)
      expect(vat.value).toBe(inputData.vat)
      expect(pct.value).toBe(inputData.pct)
      expect(commentary.value).toBe(inputData.commentary)

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      console.log("foooooooooooooooooooooooooooorm", form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(updateBill).toHaveBeenCalled()



    })

  })
  describe("When a error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      document.body.innerHTML = ''
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      document.body.innerHTML = BillsUI({ error: 'Erreur 500' })
      const message = screen.getByText(/Erreur 500/)

      expect(message).toBeTruthy()
    })


  })

})
