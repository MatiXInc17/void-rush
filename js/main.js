import { Menu } from "./menu.js";
import { Game } from "./game.js";


const canvas =
    document.querySelector("#gameCanvas");


const game =
    new Game(canvas);


const menu =
    new Menu(game);


game.setMenu(menu);
