options(shiny.autoreload = TRUE)
options(shiny.port = 8081)
options(shiny.launch.browser = FALSE)

# Load necessary libraries
library(shiny)
library(plotly)
library(readr)
library(dplyr)
library(lubridate)
library(DT)
library(jsonlite)

# Define UI
ui <- fluidPage(
  # CSS styling
  tags$head(
    tags$style(HTML("
      body {
        font-family: Arial;
        padding: 1rem;
      }
      h1, h2 {
        color: #475C7A;
      }
      .styled-table {
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 0.9em;
        min-width: 400px;
        max-width: 100%;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: 0.3s;
      }
      .bold {
        color: #D8737F;
      }
      .table-wrapper {
        max-width: 100%;
        overflow-x: auto;
      }
      .styled-table thead tr {
        background-color: #475C7A;
        color: #ffffff;
        text-align: left;
      }
      .styled-table th,
      .styled-table td {
        padding: 12px 15px;
      }
      .styled-table tbody tr {
        border-bottom: 1px solid #dddddd;
      }
      .styled-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
      }
      .styled-table tbody tr.active-row {
        font-weight: bold;
        color: #009879;
      }
      .styled-table td:first-child,
      th:first-child {
        border-left: none;
      }
      .data-wrapper {
        display: flex;
        justify-content: center;
        flex-direction: column;
      }
      .reference {
        color: #475C7A;
      }
      .card {
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        border-radius: 5px;
      }
      .hospitalization-wrapper {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        flex-wrap: wrap;
      }
    "))
  ),
  h1("COVID 19 Realtime Data"),
  p("This real-time dashboard provides insights into current trends of COVID 19 based on metrics including testing, hospitalizations, and deaths. The data below is refreshed daily from a variety of CDC provided sources. See ", a(href="#data-info", "Data Info"), " below for more information."),
  div(class="data-wrapper",
      div(class="table-wrapper",
          DTOutput("covid_table")
      ),
      tags$ul(
        tags$li("Seasons are from October 1st to September 30th")
      ),
      h2("Hospitalization Data"),
      div(class="hospitalization-wrapper",
          plotlyOutput("hospitalization_plot1"),
          plotlyOutput("hospitalization_plot2"),
          div(class="table-wrapper",
              DTOutput("hospitalizations_table")
          )
      ),
      h2(id="data-info", "Data Info"),
      uiOutput("dates_info")
  )
)

# Define server logic
server <- function(input, output, session) {
  # Base URL for data files
  base_url <- "https://quartzdata.s3.amazonaws.com/datasets/"

  # Function to get full URL
  get_url <- function(key) {
    paste0(base_url, key)
  }

  # Load COVID data
  covid_data <- reactive({
    read_csv(get_url("covid.csv"))
  })
  
  output$covid_table <- renderDT({
    datatable(covid_data(), 
              options = list(
                scrollX = TRUE,
                paging = FALSE,
                searching = FALSE,
                info = FALSE
              ), 
              class = 'styled-table')
  })
  
  # Load hospitalization data by age
  hospitalization_data <- reactive({
    read_csv(get_url("hospitalizations-by-age.csv"))
  })
  
  output$hospitalizations_table <- renderDT({
    datatable(hospitalization_data(), 
              options = list(
                scrollX = TRUE,
                paging = FALSE,
                searching = FALSE,
                info = FALSE
              ), 
              class = 'styled-table')
  })
  
  # Load trend hospitalizations data
  trend_hospitalizations_data <- reactive({
    read_csv(get_url("trend-hospitalizations.csv"))
  })
  
  # First hospitalization plot
  output$hospitalization_plot1 <- renderPlotly({
    data <- trend_hospitalizations_data()
    if (is.null(data)) return(NULL)
    
    # Convert week_ending_date to Date
    data$week_ending_date <- as.Date(data$week_ending_date)
    
    # Create timeData
    years <- 2020:2022
    timeData <- data.frame(
      start = as.Date(paste0(years, "-10-01")),
      end = as.Date(paste0(years + 1, "-09-30")),
      label = as.Date(paste0(years, "-10-10")),
      fillcolor = c("#D8737F", "#E8A87C", "#F9B775"),
      text = paste0(years, "/", years + 1)
    )
    
    # Add latest data (assuming latest season)
    latest_data_end <- max(data$week_ending_date)
    timeData <- rbind(timeData, data.frame(
      start = max(data$week_ending_date) - 365, # Adjust as needed
      end = latest_data_end,
      label = latest_data_end - 100,
      fillcolor = "orange",
      text = "Latest"
    ))
    
    # Create the plot
    p <- plot_ly(data, x = ~week_ending_date, y = ~rate, type = 'scatter', mode = 'lines+markers', marker = list(color = 'black'))
    
    # Add shapes for seasons
    shapes_list <- lapply(1:nrow(timeData), function(i) {
      list(
        type = "rect",
        x0 = timeData$start[i],
        x1 = timeData$end[i],
        y0 = 0,
        y1 = -5,
        fillcolor = timeData$fillcolor[i],
        opacity = 0.4,
        line = list(width = 0)
      )
    })
    
    # Add text annotations
    annotations_list <- lapply(1:nrow(timeData), function(i) {
      list(
        x = timeData$label[i],
        y = -1,
        text = timeData$text[i],
        showarrow = FALSE,
        xanchor = 'left',
        yanchor = 'top'
      )
    })
    
    p <- p %>% layout(
      title = "Hospitalization Trends",
      xaxis = list(title = "Week"),
      yaxis = list(title = "Hospitalization Rate"),
      shapes = shapes_list,
      annotations = annotations_list
    )
    
    p
  })
  
  # Second hospitalization plot
  output$hospitalization_plot2 <- renderPlotly({
    data <- trend_hospitalizations_data()
    if (is.null(data)) return(NULL)
    
    # Convert week_ending_date to Date
    data$week_ending_date <- as.Date(data$week_ending_date)
    
    # Create timeData
    years <- 2020:2022
    timeData <- data.frame(
      start = as.Date(paste0(years, "-10-01")),
      end = as.Date(paste0(years + 1, "-09-30")),
      label = as.Date(paste0(years, "-12-10")),
      fillcolor = c("#D8737F", "#D8737F", "#D8737F"),
      text = paste0(years, "/", years + 1)
    )
    
    p <- plot_ly()
    for (i in 1:nrow(timeData)) {
      season_data <- data %>% filter(week_ending_date >= timeData$start[i] & week_ending_date <= timeData$end[i])
      if (nrow(season_data) > 0) {
        # Adjust dates to common year (e.g., 2024)
        adjusted_dates <- season_data$week_ending_date
        adjusted_dates <- ifelse(month(adjusted_dates) <= 9, update(adjusted_dates, year = 2024), update(adjusted_dates, year = 2023)) |> as.Date()
        p <- p %>% add_trace(x = adjusted_dates, y = season_data$rate, type = 'scatter', mode = 'lines+markers', name = timeData$text[i], line = list(color = timeData$fillcolor[i]))
      }
    }
    p <- p %>% layout(
      title = "Hospitalization Trends by Season",
      xaxis = list(title = "Month/Day", tickformat = "%m/%d", tickangle = -45),
      yaxis = list(title = "Hospitalization Rate"),
      showlegend = TRUE
    )
    
    p
  })
  
  # Load dates info
  dates_info <- reactive({
    tryCatch({
      json_data <- readLines(get_url("covid-dates.json"), warn = FALSE)
      fromJSON(json_data)
    }, error = function(e) {
      # Print error message to console for debugging
      print(paste("Error parsing JSON:", e$message))
      print(paste("Raw JSON data:", json_data))
      NULL
    })
  })
  
  output$dates_info <- renderUI({
    dates <- dates_info()
    if (is.null(dates)) {
      return(tags$p("Error loading dates information. Please check the console for details."))
    }
    ul_list <- lapply(names(dates), function(k) {
      tags$ul(class="reference", paste(k, ": ", dates[[k]]))
    })
    do.call(tagList, ul_list)
  })
}

# Run the application
shinyApp(ui, server)