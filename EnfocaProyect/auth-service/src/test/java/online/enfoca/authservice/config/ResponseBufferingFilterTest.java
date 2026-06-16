package online.enfoca.authservice.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class ResponseBufferingFilterTest {

    private final ResponseBufferingFilter filter = new ResponseBufferingFilter();

    @Test
    void doFilter_copiesBodyToResponse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> res.getWriter().write("response body");

        filter.doFilter(request, response, chain);

        assertThat(response.getContentAsString()).isEqualTo("response body");
    }

    @Test
    void doFilter_setsContentLengthHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> res.getWriter().write("12345");

        filter.doFilter(request, response, chain);

        assertThat(response.getContentAsString()).isEqualTo("12345");
    }

    @Test
    void doFilter_handlesEmptyResponseBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        FilterChain chain = (req, res) -> {};

        filter.doFilter(request, response, chain);

        assertThat(response.getContentAsString()).isEmpty();
    }
}
