/**
 * @jest-environment jsdom
 */

import { fire, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import Store from "../app/Store.js";


jest.mock("../app/Store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = dates.sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('then the new Bill Button appear', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const button = screen.getByTestId("btn-new-bill")
      expect(button.textContent).toBe("Nouvelle note de frais")
    })

    test('then the new bill button allow to navigate on new bill page', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = () => { document.body.innerHTML = ROUTES_PATH.Bills }
      console.log("navigattion", document.body)
      const store = null
      const bill = new Bills({ document, onNavigate, store, bills, localStorage: window.localStorage })
      const button = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      button.addEventListener("click", handleClickNewBill())
      expect(handleClickNewBill).toHaveBeenCalled()


    })

  })

})

describe("Given I am a user connected as employee", () => {
  describe("when i click on the icon eye", () => {
    test("then a modal should open", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathName) => { document.body.innerHTML = ROUTES({ pathname }) }
      const store = null
      $.fn.modal = jest.fn()
      const bill = new Bills({ document, onNavigate, store, bills, localStorage: window.localStorage })
      console.log("bill", bill)
      const icons = screen.getAllByTestId("icon-eye")
      const icon1 = icons[1]
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(icon1))

      icon1.addEventListener("click", handleClickIconEye)
      userEvent.click(icon1)

      expect(handleClickIconEye).toHaveBeenCalled()
      const modal = screen.getByTestId("modal-bills")
      expect(modal.className).toBe('modal fade')
    })
  })
})

//test d'integration

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const contentPending = await screen.getByText("Mes notes de frais")

      expect(contentPending).toBeTruthy()

    })
    describe("When a error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
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
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        console.log("coucou", message)
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

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })


    })

  })
})

