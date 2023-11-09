import {
    listFont,
    listBg
  } from "./helpers/common.mjs";

export const RegisterSettings = function () {
    /* ------------------------------------ */
    /* User settings                        */
    /* ------------------------------------ */
    game.settings.register("mutants-and-masterminds-3e", "typeroll", {
        name: "MM3.SETTING.Typejet",
        hint: "",
        scope: "world",
        config: true,
        default: "1D20",
        type: String,
        choices:{
            "1D20":"MM3.SETTING.Standard1d20",
            "3D20":"MM3.SETTING.Guide3d20",
            "3D6":"MM3.SETTING.3d6",
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "dcroll", {
        name: "MM3.SETTING.DCRoll",
        hint: "MM3.SETTING.DCRollHint",
        scope: "client",
        config: true,
        default: "shift",
        type: String,
        choices:{
            "shift":"MM3.SETTING.ShiftClicgauche",
            "clic":"MM3.SETTING.Clicgauche",
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "speedcalculate", {
        name: "MM3.SETTING.SpeedAutocalc",
        hint: "MM3.SETTING.SpeedAutocalcHint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "measuresystem", {
        name: "MM3.SETTING.MeasureSystem",
        hint: "MM3.SETTING.MeasureSystemHint",
        scope: "world",
        config: true,
        default: "metric",
        type: String,
        choices:{
            "metric":"MM3.SETTING.Metric",
            "imperial":"MM3.SETTING.Imperial",
        },
    });

    game.settings.register("mutants-and-masterminds-3e", "pauselogo", {
        name: "MM3.SETTING.Pause",
        hint: "MM3.SETTING.PauseHint",
        scope: "client",
        config: true,
        default: "Pause_Icon_1",
        type: String,
        choices:{
            "default":"MM3.SETTING.Defaut",
            "Pause_Icon_1":"MM3.SETTING.Pause1",
            "Pause_Icon_2":"MM3.SETTING.Pause2",
            "Pause_Icon_3":"MM3.SETTING.Pause3",
        }, 
        onChange: value => { 
            if(value !== 'default') {
                $("#pause img").remove();
                $("#pause figcaption").remove();
                
                const pause = $("#pause video");
                if(pause.length === 0) {
                    $("#pause").append(`<video width="300" height="200" loop autoplay="autoplay"><source src="systems/mutants-and-masterminds-3e/assets/pause/${value}.webm" type="video/webm" /></video>`);
                } else {
                    $("#pause video").attr('src', `systems/mutants-and-masterminds-3e/assets/pause/${value}.webm`);
                    $("#pause video")[0].load();
                    $("#pause video")[0].play();
                }                
            } else {
                $("#pause video").remove();
                $("#pause").append(`<img src="icons/svg/clockwork.svg" class="fa-spin">`);
                $("#pause").append(`<figcaption>Game Paused</figcaption>`);
                
            }            
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "menu", {
        name: "MM3.SETTING.Menu",
        hint: "MM3.SETTING.MenuHint",
        scope: "client",
        config: true,
        default: "bleufonce",
        type: String,
        choices:{
            "default":"MM3.SETTING.Defaut",
            "bleuclair":"MM3.SETTING.BleuClair",
            "violetclair":"MM3.SETTING.VioletClair",
            "violet":"MM3.SETTING.Violet",
            "bleufonce":"MM3.SETTING.BleuFonce",
        }, 
        onChange: value => { 
            $("div#interface").removeClass(listBg);
            $("div#interface").addClass(value);
        }
    });

    const mFont = foundry.utils.mergeObject({
        "default":"MM3.Non",
        "var(--font-primary)":"MM3.SETTING.Defaut",
    }, listFont);

    game.settings.register("mutants-and-masterminds-3e", "font", {
        name: "MM3.SETTING.ForceFont",
        scope: "world",
        config: true,
        default: "default",
        type: String,
        choices:mFont, 
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "diagonalMovement", {
        name: "MM3.SETTING.DiagonalMovement.Name",
        hint: "MM3.SETTING.DiagonalMovement.Hint",
        scope: "world",
        config: true,
        default: "EQUIDISTANT",
        type: String,
        choices: {
            "MANHATTAN": "MM3.SETTING.DiagonalMovement.Manhattan",
            "EQUIDISTANT": "MM3.SETTING.DiagonalMovement.Equidistant",
            "PATHFINDER": "MM3.SETTING.DiagonalMovement.Pathfinder",
        },
        onChange: value => canvas.grid.diagonalRule = value
    });
};