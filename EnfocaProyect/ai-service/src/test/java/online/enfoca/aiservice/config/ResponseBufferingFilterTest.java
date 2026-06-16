package online.enfoca.aiservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class ResponseBufferingFilterTest {

    private final ResponseBufferingFilter filter = new ResponseBufferingFilter();

    @Test
    void doFilter_pasaCadena_sinExcepcion() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void doFilter_conCuerpo_copiaCuerpoARespuesta() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            res.getOutputStream().write("{\"status\":\"ok\"}".getBytes());
        });

        assertThat(response.getContentAsString()).isEqualTo("{\"status\":\"ok\"}");
    }
}
