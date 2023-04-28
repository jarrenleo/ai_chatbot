import { Telegram } from "./telegram.js";
import { Discord } from "./discord.js";

(function () {
  new Telegram();
  new Discord();
})();
