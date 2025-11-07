import * as TmpBlockly from 'blockly'

const CustomDialog: any = {}

CustomDialog.hide = function () {
  if (CustomDialog.backdropDiv_) {
    CustomDialog.backdropDiv_.style.display = 'none'
    CustomDialog.dialogDiv_.style.display = 'none'
  }
}

CustomDialog.show = function (title: any, message: any, options: any) {
  let backdropDiv = CustomDialog.backdropDiv_
  let dialogDiv = CustomDialog.dialogDiv_
  if (!dialogDiv) {
    backdropDiv = document.createElement('div')
    backdropDiv.id = 'customDialogBackdrop'
    backdropDiv.style.cssText = `
position: absolute;
top: 0; left: 0; right: 0; bottom: 0;
background-color: rgba(0, 0, 0, .7);
z-index: 100;
`
    document.body.appendChild(backdropDiv)

    dialogDiv = document.createElement('div')
    dialogDiv.id = 'customDialog'
    dialogDiv.style.cssText = `
background-color: #fff;
width: 400px;
margin: 20px auto 0;
padding: 10px;`
    backdropDiv.appendChild(dialogDiv)

    dialogDiv.onclick = function (event: any) {
      event.stopPropagation()
    }

    CustomDialog.backdropDiv_ = backdropDiv
    CustomDialog.dialogDiv_ = dialogDiv
  }
  backdropDiv.style.display = 'block'
  dialogDiv.style.display = 'block'

  dialogDiv.innerHTML = `
<header class="customDialogTitle"></header>
<div class="customDialogMessage"></div>
${options.showInput ? '<div><input id="customDialogInput"></div>' : ''}
<div class="customDialogButtons">
    ${options.showCancel ? '<button id="customDialogCancel">Cancel</button>' : ''}
    ${options.showOkay ? '<button id="customDialogOkay">OK</button>' : ''}
</div>`
  let customDialogTitle = typeof title === 'string' ? document.createTextNode(title) : title
  let customDialogMessage = typeof message === 'string' ? document.createTextNode(message) : message

  dialogDiv.getElementsByClassName('customDialogTitle')[0].appendChild(customDialogTitle)

  dialogDiv.getElementsByClassName('customDialogMessage')[0].appendChild(customDialogMessage)

  let onOkay = function (event: any) {
    CustomDialog.hide()
    options.onOkay && options.onOkay()
    event && event.stopPropagation()
  }
  let onCancel = function (event: any) {
    CustomDialog.hide()
    options.onCancel && options.onCancel()
    event && event.stopPropagation()
  }

  let dialogInput = document.getElementById('customDialogInput')
  CustomDialog.inputField = dialogInput
  if (dialogInput) {
    dialogInput.focus()

    dialogInput.onkeyup = function (event) {
      if (event.key == 'Enter') {
        // Process as OK when user hits enter.
        onOkay(null)
        return false
      } else if (event.key == 'Escape') {
        // Process as cancel when user hits esc.
        onCancel(null)
        return false
      }
    }
  } else {
    let okay = document.getElementById('customDialogOkay')
    okay && okay.focus()
  }

  if (options.showOkay) {
    document.getElementById('customDialogOkay')?.addEventListener('click', onOkay)
  }
  if (options.showCancel) {
    document.getElementById('customDialogCancel')?.addEventListener('click', onCancel)
  }
  backdropDiv.onclick = onCancel
}

interface TmpBlocklyBlock extends TmpBlockly.Block {
  INTRODUCE_MESSAGE?: string
}

export function addBasicIntroductionBlocks(
  Blockly: typeof TmpBlockly,
  pythonGenerator: any,
  workspaceSvg: any
) {
  const INTRODUCE_ICON =
    'data:image/svg+xml;base64,PHN2ZyB0PSIxNjQwMTUzMjIxMzA3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNzMiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cGF0aCBkPSJNNjQzLjYwMyA1NzQuNTQySDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguOTIzLTExLjg3NSAxOS44NzUgMCAxMC45NiA1LjMgMTkuODEzIDExLjg3NSAxOS44MTNoMzYxLjA2OWM2LjU2IDAgMTEuODY0LTguODUyIDExLjg2NC0xOS44MTMgMC0xMC45NjItNS4zMDUtMTkuODc1LTExLjg2NC0xOS44NzV6IG0wIDBNNjQzLjYwMyA0ODIuOTE3SDI4Mi41MzRjLTYuNTc1IDAtMTEuODc1IDguODg3LTExLjg3NSAxOS44ODIgMCAxMC45NTcgNS4zIDE5LjgxNCAxMS44NzUgMTkuODE0aDM2MS4wNjljNi41NiAwIDExLjg2NC04Ljg1OCAxMS44NjQtMTkuODE0IDAtMTAuOTk1LTUuMzA1LTE5Ljg4Mi0xMS44NjQtMTkuODgyeiBtMCAwTTY0My42MDMgMzkxLjM1NEgyODIuNTM0Yy02LjU3NSAwLTExLjg3NSA4Ljg2Mi0xMS44NzUgMTkuODIzIDAgMTAuOTU2IDUuMyAxOS44NDkgMTEuODc1IDE5Ljg0OWgzNjEuMDY5YzYuNTYgMCAxMS44NjQtOC44OTMgMTEuODY0LTE5Ljg1IDAtMTAuOTYtNS4zMDUtMTkuODIyLTExLjg2NC0xOS44MjJ6IG0wIDAiIHAtaWQ9IjIwNzQiPjwvcGF0aD48cGF0aCBkPSJNOTAwLjE1OCAxNzhjMC02Mi4zMDgtNTAuNjE0LTExMy4wMTctMTEyLjgyOS0xMTMuMDE3SDIzNC4yMDJjLTAuMjU4IDAtMC40ODMgMC4wMzktMC43NjQgMC4wNTUtMC4yNjMtMC4wMTYtMC41MDgtMC4wNTUtMC43NzEtMC4wNTUtNjAuNTcgMC0xMDkuODU2IDUwLjcwOS0xMDkuODU2IDExMy4wMTd2NjYwLjcwOWMwIDguMzI4IDMuMjY0IDE2LjI2IDkuMDg1IDIyLjAwM2w4OS43NTIgODkuMDU2YzExLjUxIDExLjM5OCAyOS43MTggMTEuMzk4IDQxLjIyNiAwbDkxLjU2NS05MC44NSA5NC45OTggOTQuMjQzYzExLjUxMiAxMS40NDggMjkuNzM2IDExLjQ0OCA0MS4yNDcgMGw5NS4wMDQtOTQuMjQ0IDk1LjAxMiA5NC4yNDRjNS43NTQgNS43MSAxMy4xOTEgOC41OCAyMC41OTggOC41OCA3LjQyOSAwIDE0Ljg3OS0yLjg3IDIwLjYzMy04LjU4bDg2LTg1LjMwOGM1LjgwNi01Ljc3OCA5LjA4My0xMy43MDYgOS4wODMtMjEuOTk4VjI4Ni45NmM0Ny44NDUtMTMuMTM4IDgzLjE0NC01Ni45NjMgODMuMTQ0LTEwOC45NjF6IG0tMTkzLjMgNzE5LjkzM2wtOTcuMzAzLTk2LjUzOWMtMTEuNzY2LTExLjcwNi0zMC40MS0xMS43MDYtNDIuMiAwbC05Ny4yOCA5Ni41MzktOTcuMjkzLTk2LjUzOWMtMTEuNzg4LTExLjcwNi0zMC40MzEtMTEuNzA2LTQyLjIyMyAwbC05My43NjUgOTMuMDEtNjEuNTA2LTYxVjE3MC4wODdjMC0yOS4zMzEgMjMuMTg0LTUzLjE4IDUxLjY4LTUzLjE4IDAuMjU2IDAgMC40ODQtMC4wNzYgMC43MTgtMC4wNzYgMC4zMDQgMCAwLjU3NiAwLjA3NyAwLjg1NyAwLjA3N2gwLjEwNmMzMC4xMyAwLjA2NyA1NC42MTYgMjMuOTA0IDU0LjYxNiA1My4xNzkgMCAyOS4zMjMtMjQuNTQxIDUzLjE5My01NC43MjIgNTMuMTkzLTE2LjgwNCAwLTMwLjM5NCAxMy45OC0zMC4zOTQgMzEuMjU0IDAgMTcuMjk1IDEzLjU5IDMxLjMxNCAzMC4zOTQgMzEuMzE0aDUzNnY1NTQuODI5bC01Ny42ODYgNTcuMjU1eiBtNjcuOTg0LTY2MS45NjlsLTQ3My40NzctMy4wMjhjMjguODM0LTE0LjEzNCAyOC44NTQtNDIuNTQgMjguODM0LTUxLjA4MS0wLjA3My0zMS44ODQtNC45MS00NS45ODQtMTMuMDQtNjEuNjk4bDQ3NC4wMjYtMC43OThjMjkuNzQgMCA2MC43NjUgMzEuMTg3IDYwLjc2NSA2MC4wODUgMCAyOC44OS0zMS40IDU1LjA0NC02MS4xMzggNTUuMDQ0bC0xNS45NyAxLjQ3NnogbTAgMCIgcC1pZD0iMjA3NSI+PC9wYXRoPjwvc3ZnPg=='
  try {
    Blockly.Extensions.register('basic_introduction_extension', function (this: TmpBlocklyBlock) {
      const thisBlock = this
      this.getInput('Introduction')
          ?.appendField(Blockly.Msg['AST_WITH'])
          .appendField(
              new Blockly.FieldImage(INTRODUCE_ICON, 20, 20, '上下文管理器的介绍', async function () {
                CustomDialog.show('AST_WITH', thisBlock.INTRODUCE_MESSAGE, { showOkay: true })
              })
          )
    })
  } catch (e) {
    
  }
}
