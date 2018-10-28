function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function removeAllItems(form) {
  var allItems = form.getItems();
  for (var i=0; i<allItems.length; i++) {
    var item = allItems[i];
    if (item.getType() == FormApp.ItemType.PAGE_BREAK) {
      item.asPageBreakItem().setGoToPage(FormApp.PageNavigationType.RESTART)
    }
    if (item.getType() == FormApp.ItemType.LIST) {
      item.asListItem().setChoiceValues([""]);
    }
  }
  for (var i=allItems.length-1; i>=0; i--) {
    form.deleteItem(i);
  }
}

function isBasicSkill(level) {
  return level === "P1" || level === "P2";
}

function getBasicAndAdvancedSkills(skillLevels) {
  var basicSkills = [];
  var advancedSkills = [];
  skillLevels.map(function(sl) {
    if (isBasicSkill(sl.level)) {
      basicSkills.push.apply(basicSkills, sl.skills)
    } else {
      advancedSkills.push.apply(advancedSkills, sl.skills)
    }
  });

  return {
    basicSkills: basicSkills,
    advancedSkills: advancedSkills,
  };
}

function getOrderedSkillAreas() {
  var skillAreas = [];
  config.orderOfSkillAreas.map(function(name) {
    for(var i=0; i<config_skillAreas.length; i++) {
      var sa = config_skillAreas[i];
      if (sa.title === name) {
        skillAreas.push(sa)
      }
    }
  })
  return skillAreas
}

function processForm(formObject) {
  var feedbackFormUrl = formObject.feedbackFormUrl;

  var form = FormApp.openByUrl(feedbackFormUrl);
  removeAllItems(form);

  form.setCollectEmail(true).setTitle("TEST - Feedback for Some Pivot");
  var listSkillAreas = form.addListItem().setTitle("What skill area would you like to provide feedback about?").setHelpText(config.blurbs.firstPage).setRequired(true);

  var pageWhatToDoNow = form.addPageBreakItem().setTitle("Leave additional feedback?").setGoToPage(FormApp.PageNavigationType.SUBMIT);
  var listWhatToDoNow = form.addListItem().setTitle("What would you like to do now?").setRequired(true);

  var skillAreas = getOrderedSkillAreas().map(function(skillArea) {
    var categorizedSkills = getBasicAndAdvancedSkills(skillArea.skill_levels)
    var basicPage = form.addPageBreakItem().setTitle(skillArea.title).setHelpText(skillArea.description);
    form.addSectionHeaderItem().setTitle(config.blurbs.aboveGrid);
    form.addCheckboxGridItem().setColumns(config.gridColumns).setRows(categorizedSkills.basicSkills);
    form.addParagraphTextItem().setTitle("Additional context").setHelpText(config.blurbs.additionalContext);
    var advancedPage = form.addPageBreakItem().setTitle("Advanced " + skillArea.title).setHelpText(skillArea.description);
    form.addSectionHeaderItem().setTitle(config.blurbs.aboveGrid);
    form.addCheckboxGridItem().setColumns(config.gridColumns).setRows(categorizedSkills.advancedSkills);
    form.addParagraphTextItem().setTitle("Additional context").setHelpText(config.blurbs.additionalContext);
    return {
      config: skillArea,
      basicPage: basicPage,
      advancedPage: advancedPage
    }
  });
  listSkillAreas.setChoices(skillAreas.map(function(a) { return listSkillAreas.createChoice(a.config.title, a.basicPage); }));
  skillAreas.map(function(a) {
    a.basicPage.setGoToPage(pageWhatToDoNow);
    a.advancedPage.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  });

  // build page: pre-submit thanks
  var pagePreSubmit = form.addPageBreakItem().setHelpText(config.blurbs.preSubmit).setTitle("Almost done").setGoToPage(pageWhatToDoNow);;

  listWhatToDoNow.setChoices([
    listWhatToDoNow.createChoice("Leave feedback on another skill area", FormApp.PageNavigationType.RESTART),
    listWhatToDoNow.createChoice("Submit form", pagePreSubmit)
  ]);

  return '<b> Updated form </b>'
}
